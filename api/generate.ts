export const config = {
  maxDuration: 30,
};

const ER_DIAGRAM_TOOL = {
  name: 'er_diagram',
  description: 'Output the Entity-Relationship (ER) model diagram structure in Chen notation.',
  input_schema: {
    type: 'object',
    properties: {
      entities: {
        type: 'array',
        description: 'List of entities in the database model.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Entity name, e.g. Patient, Doctor, Appointment' },
            isWeak: { type: 'boolean', description: 'True if this is a weak entity (double rectangle)' },
            attributes: {
              type: 'array',
              description: 'Attributes of this entity',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Attribute name' },
                  isPrimaryKey: { type: 'boolean', description: 'True if primary key (solid underline)' },
                  attributeType: {
                    type: 'string',
                    enum: ['primary', 'partial', 'multivalued', 'derived', 'composite', 'normal'],
                    description: 'Type of attribute in Chen notation'
                  },
                  subAttributes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional sub-attributes if composite'
                  }
                },
                required: ['name']
              }
            }
          },
          required: ['name', 'attributes']
        }
      },
      relationships: {
        type: 'array',
        description: 'List of relationships connecting entities.',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'First connected entity name' },
            to: { type: 'string', description: 'Second connected entity name' },
            name: { type: 'string', description: 'Relationship verb or name, e.g. Treats, Prescribes' },
            cardinality: {
              type: 'string',
              enum: ['1:1', '1:N', 'N:1', 'M:N'],
              description: 'Cardinality ratio in Chen notation'
            },
            isIdentifying: { type: 'boolean', description: 'True if identifying relationship for weak entity (double diamond)' }
          },
          required: ['from', 'to', 'name', 'cardinality']
        }
      }
    },
    required: ['entities', 'relationships']
  }
};

export default async function handler(req: any, res: any) {
  // 1. Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST' });
  }

  try {
    // 2. Parse and validate body.description
    let body = req.body;
    if (Buffer.isBuffer(body)) {
      try {
        body = JSON.parse(body.toString('utf-8'));
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const description = body?.description;
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Please provide a database description.' });
    }

    const cleanDesc = description.trim();
    if (cleanDesc.length > 1500) {
      return res.status(400).json({ error: 'Description is too long (maximum 1500 characters).' });
    }

    // 3. Read process.env.ANTHROPIC_API_KEY
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY' });
    }

    // 4. Call Claude API with er_diagram tool
    const buildPayload = (modelName: string) => ({
      model: modelName,
      max_tokens: 2000,
      system: 'You are a university DBMS professor and database architect. Generate a rich, comprehensive Entity-Relationship (ER) model in Chen notation based on the user description. Identify weak entities, partial keys, multivalued attributes, derived attributes, and cardinalities. Always call the er_diagram tool with valid schema.',
      messages: [
        {
          role: 'user',
          content: cleanDesc
        }
      ],
      tools: [ER_DIAGRAM_TOOL],
      tool_choice: {
        type: 'tool',
        name: 'er_diagram'
      }
    });

    const callClaude = async (modelName: string) => {
      return fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify(buildPayload(modelName))
      });
    };

    // Primary model as requested: claude-haiku-5-5, with fallback if model is not available
    let response = await callClaude('claude-haiku-5-5');
    if (!response.ok && (response.status === 404 || response.status === 400)) {
      const peek = await response.clone().json().catch(() => ({}));
      if (peek?.error?.type === 'not_found_error' || peek?.error?.message?.includes('model')) {
        response = await callClaude('claude-3-5-haiku-20241022');
      }
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error?.message || `Claude API returned status ${response.status}`;
      const status = response.status >= 400 && response.status < 600 ? response.status : 500;
      return res.status(status).json({ error: errMsg });
    }

    const data = await response.json();
    const toolBlock = data.content?.find(
      (block: any) => block.type === 'tool_use' && block.name === 'er_diagram'
    );

    if (!toolBlock || !toolBlock.input) {
      return res.status(502).json({ error: 'Claude did not return a valid ER diagram structure.' });
    }

    // 5. Return tool_use block's input as JSON with status 200
    return res.status(200).json(toolBlock.input);
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Internal server error while generating diagram'
    });
  }
}
