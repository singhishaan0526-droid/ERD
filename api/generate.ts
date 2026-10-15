export const config = {
  maxDuration: 30,
};

const ER_SCHEMA_GEMINI = {
  type: 'OBJECT',
  properties: {
    entities: {
      type: 'ARRAY',
      description: 'List of entities in the database model.',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Entity name, e.g. Patient, Doctor' },
          isWeak: { type: 'BOOLEAN', description: 'True if weak entity (double rectangle)' },
          attributes: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING', description: 'Attribute name' },
                isPrimaryKey: { type: 'BOOLEAN', description: 'True if primary key' },
                attributeType: {
                  type: 'STRING',
                  enum: ['primary', 'partial', 'multivalued', 'derived', 'composite', 'normal']
                },
                subAttributes: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
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
      type: 'ARRAY',
      description: 'List of relationships connecting entities.',
      items: {
        type: 'OBJECT',
        properties: {
          from: { type: 'STRING', description: 'First entity name' },
          to: { type: 'STRING', description: 'Second entity name' },
          name: { type: 'STRING', description: 'Relationship name, e.g. Treats' },
          cardinality: {
            type: 'STRING',
            enum: ['1:1', '1:N', 'N:1', 'M:N']
          },
          isIdentifying: { type: 'BOOLEAN' }
        },
        required: ['from', 'to', 'name', 'cardinality']
      }
    }
  },
  required: ['entities', 'relationships']
};

const ER_DIAGRAM_TOOL_CLAUDE = {
  name: 'er_diagram',
  description: 'Output the Entity-Relationship (ER) model diagram structure in Chen notation.',
  input_schema: {
    type: 'object',
    properties: {
      entities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            isWeak: { type: 'boolean' },
            attributes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  isPrimaryKey: { type: 'boolean' },
                  attributeType: {
                    type: 'string',
                    enum: ['primary', 'partial', 'multivalued', 'derived', 'composite', 'normal']
                  },
                  subAttributes: {
                    type: 'array',
                    items: { type: 'string' }
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
        items: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            name: { type: 'string' },
            cardinality: {
              type: 'string',
              enum: ['1:1', '1:N', 'N:1', 'M:N']
            },
            isIdentifying: { type: 'boolean' }
          },
          required: ['from', 'to', 'name', 'cardinality']
        }
      }
    },
    required: ['entities', 'relationships']
  }
};

async function generateWithGemini(description: string, apiKey: string) {
  const models = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];
  let lastError = 'No response from Gemini';

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are a university DBMS professor and database architect. Generate a rich, comprehensive Entity-Relationship (ER) model in Chen notation based on the user description. Identify weak entities, partial keys, multivalued attributes, derived attributes, and cardinalities.'
            }]
          },
          contents: [{ parts: [{ text: description }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: ER_SCHEMA_GEMINI
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        lastError = errJson?.error?.message || `Gemini status ${response.status}`;
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = 'Empty response from Gemini';
        continue;
      }

      const parsed = JSON.parse(text);
      if (parsed.entities && parsed.relationships) {
        return parsed;
      }
    } catch (e: any) {
      lastError = e?.message || 'Gemini error';
    }
  }

  throw new Error(lastError);
}

async function generateWithClaude(description: string, apiKey: string) {
  const buildPayload = (modelName: string) => ({
    model: modelName,
    max_tokens: 2000,
    system: 'You are a university DBMS professor and database architect. Generate a rich, comprehensive Entity-Relationship (ER) model in Chen notation based on the user description. Identify weak entities, partial keys, multivalued attributes, derived attributes, and cardinalities. Always call the er_diagram tool with valid schema.',
    messages: [{ role: 'user', content: description }],
    tools: [ER_DIAGRAM_TOOL_CLAUDE],
    tool_choice: { type: 'tool', name: 'er_diagram' }
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
    const error: any = new Error(errMsg);
    error.status = status;
    throw error;
  }

  const data = await response.json();
  const toolBlock = data.content?.find(
    (block: any) => block.type === 'tool_use' && block.name === 'er_diagram'
  );

  if (!toolBlock || !toolBlock.input) {
    const error: any = new Error('Claude did not return a valid ER diagram structure.');
    error.status = 502;
    throw error;
  }

  return toolBlock.input;
}

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

    // 3. Read API keys (support both Gemini and Anthropic Claude)
    const geminiKeyRaw = process.env.GEMINI_API_KEY || (
      process.env.ANTHROPIC_API_KEY && (process.env.ANTHROPIC_API_KEY.startsWith('AQ.') || process.env.ANTHROPIC_API_KEY.startsWith('AIza'))
        ? process.env.ANTHROPIC_API_KEY
        : null
    );

    const anthropicKeyRaw = process.env.ANTHROPIC_API_KEY;

    if (geminiKeyRaw) {
      const geminiKey = geminiKeyRaw.trim().replace(/^["']|["']$/g, '');
      const result = await generateWithGemini(cleanDesc, geminiKey);
      return res.status(200).json(result);
    }

    if (anthropicKeyRaw) {
      const apiKey = anthropicKeyRaw.trim().replace(/^["']|["']$/g, '');
      if (apiKey.startsWith('apikey_')) {
        return res.status(400).json({
          error: 'Invalid API key: You entered an Anthropic Key ID (starts with "apikey_") instead of the Secret Key. Anthropic secret keys start with "sk-ant-api03-". Please generate a new key in Anthropic Console or use GEMINI_API_KEY.'
        });
      }
      const result = await generateWithClaude(cleanDesc, apiKey);
      return res.status(200).json(result);
    }

    return res.status(500).json({
      error: 'Server is missing GEMINI_API_KEY or ANTHROPIC_API_KEY. Please set GEMINI_API_KEY in Vercel Environment Variables.'
    });
  } catch (err: any) {
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json({
      error: err?.message || 'Internal server error while generating diagram'
    });
  }
}
