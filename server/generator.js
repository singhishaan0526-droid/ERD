/**
 * ER Diagram Auto-Generator
 * Powered by:
 * 1. Anthropic Claude API (using ANTHROPIC_API_KEY from .env)
 * 2. High-precision rule-based DBMS schema parser fallback (zero-dependency, works offline & out-of-the-box)
 * Supports full academic DBMS ER Concepts:
 * - Regular Entity (Rectangle) & Weak Entity (Double Rectangle)
 * - Key Attribute (Underline) & Partial Key / Discriminator (Dashed Underline)
 * - Multivalued Attribute (Double Ellipse) & Derived Attribute (Dashed Ellipse)
 * - Identifying Relationship (Double Diamond) & Regular Relationship (Diamond)
 */

export async function generateERDiagram(description) {
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    throw new Error('Please provide a database description.');
  }

  const cleanDesc = description.trim();

  // Try Claude if ANTHROPIC_API_KEY is present
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      console.log('Generating rich ER diagram using Anthropic Claude...');
      const claudeResult = await callClaudeAPI(cleanDesc, apiKey);
      if (isValidERModel(claudeResult)) {
        return claudeResult;
      }
    } catch (err) {
      console.warn('Claude API call encountered an issue, falling back to rich NLP rule engine:', err.message);
    }
  }

  // Fallback to our extensive DBMS Knowledge & NLP Rule Engine
  console.log('Generating rich ER diagram using built-in extensive DBMS NLP engine...');
  return parseDescriptionHeuristic(cleanDesc);
}

/**
 * Call Anthropic Claude Messages API
 */
async function callClaudeAPI(description, apiKey) {
  const endpoint = 'https://api.anthropic.com/v1/messages';

  const prompt = `You are a university professor and database design expert. Create a COMPREHENSIVE and DETAILED Entity-Relationship (ER) model in Chen notation for this description:
"${description}"

Requirements:
1. Generate a RICH, production-grade schema with 5 to 8 entities (do NOT generate an oversimplified model).
2. Use real-world DBMS concepts:
   - Identify any Weak Entities (set isWeak: true, e.g. OrderItem, Dependent, Section, Room, LineItem).
   - For Weak Entities, the connecting relationship MUST be an Identifying Relationship (isIdentifying: true).
   - Attribute types MUST be specified:
     * "primary" for Primary Key (isPrimaryKey: true)
     * "partial" for Partial Key / Discriminator of a weak entity
     * "multivalued" for attributes with multiple values (e.g. PhoneNumbers, Skills, Tags)
     * "derived" for computed attributes (e.g. Age, TotalAmount, Duration, ExperienceYears)
     * "normal" for regular attributes
3. Include 4 to 7 attributes per entity.
4. Define clear relationships connecting all entities, with cardinality: "1:1", "1:N", or "M:N".

Return ONLY a valid JSON object matching this exact schema:
{
  "entities": [
    {
      "name": "EntityName",
      "isWeak": false,
      "attributes": [
        { "name": "attr_name", "attributeType": "primary", "isPrimaryKey": true }
      ]
    }
  ],
  "relationships": [
    {
      "from": "EntityName1",
      "to": "EntityName2",
      "name": "RelationshipName",
      "cardinality": "1:N",
      "isIdentifying": false
    }
  ]
}

Do NOT include any markdown code blocks, explanation, or conversational text. Output ONLY the raw JSON object.`;

  const candidateModels = [
    'claude-3-5-haiku-20241022',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307',
    'claude-3-sonnet-20240229'
  ];

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 2500,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404 || errorText.includes('model')) {
          lastError = new Error(`Claude model ${model} error: ${errorText}`);
          continue;
        }
        throw new Error(`Anthropic Claude API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.content?.find(c => c.type === 'text')?.text;
      if (!textContent) {
        throw new Error('Empty text content received from Claude API');
      }

      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not find JSON in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return normalizeERModel(parsed);
    } catch (err) {
      lastError = err;
      if (err.message && (err.message.includes('model') || err.message.includes('404'))) {
        continue;
      }
      throw err;
    }
  }

  if (lastError) throw lastError;
  throw new Error('All Claude models failed to respond.');
}

/**
 * Robust extensive DBMS NLP Engine with real academic concepts
 */
export function parseDescriptionHeuristic(description) {
  const lower = description.toLowerCase();

  const domainModel = matchDomainTemplates(lower, description);
  if (domainModel) {
    return domainModel;
  }

  return extractGenericSchema(description);
}

/**
 * Comprehensive Domain Templates with full DBMS ER concepts
 */
function matchDomainTemplates(lower, rawText) {
  // Library domain (Comprehensive: 6 entities, weak entities, multivalued, derived)
  if (lower.includes('library') || (lower.includes('book') && (lower.includes('borrow') || lower.includes('member') || lower.includes('loan')))) {
    return {
      entities: [
        {
          name: 'Book',
          isWeak: false,
          attributes: [
            { name: 'ISBN', attributeType: 'primary', isPrimaryKey: true },
            { name: 'Title', attributeType: 'normal', isPrimaryKey: false },
            { name: 'PublicationYear', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Genre', attributeType: 'multivalued', isPrimaryKey: false },
            { name: 'TotalCopies', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Member',
          isWeak: false,
          attributes: [
            { name: 'MemberID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'Name', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Email', attributeType: 'normal', isPrimaryKey: false },
            { name: 'PhoneNumbers', attributeType: 'multivalued', isPrimaryKey: false },
            { name: 'MembershipAge', attributeType: 'derived', isPrimaryKey: false }
          ]
        },
        {
          name: 'Author',
          isWeak: false,
          attributes: [
            { name: 'AuthorID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'FullName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Biography', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Awards', attributeType: 'multivalued', isPrimaryKey: false }
          ]
        },
        {
          name: 'Publisher',
          isWeak: false,
          attributes: [
            { name: 'PublisherID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'CompanyName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Address', attributeType: 'normal', isPrimaryKey: false },
            { name: 'ContactEmail', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Loan',
          isWeak: false,
          attributes: [
            { name: 'LoanID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'IssueDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'DueDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'ReturnDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'DurationDays', attributeType: 'derived', isPrimaryKey: false }
          ]
        },
        {
          name: 'Fine',
          isWeak: true, // Weak Entity: depends on Loan
          attributes: [
            { name: 'FineNumber', attributeType: 'partial', isPrimaryKey: false }, // Discriminator
            { name: 'Amount', attributeType: 'normal', isPrimaryKey: false },
            { name: 'PaidStatus', attributeType: 'normal', isPrimaryKey: false }
          ]
        }
      ],
      relationships: [
        { from: 'Author', to: 'Book', name: 'Writes', cardinality: 'M:N', isIdentifying: false },
        { from: 'Publisher', to: 'Book', name: 'Publishes', cardinality: '1:N', isIdentifying: false },
        { from: 'Member', to: 'Loan', name: 'Takes', cardinality: '1:N', isIdentifying: false },
        { from: 'Book', to: 'Loan', name: 'Includes', cardinality: '1:N', isIdentifying: false },
        { from: 'Loan', to: 'Fine', name: 'Incurs', cardinality: '1:N', isIdentifying: true } // Identifying
      ]
    };
  }

  // School / University domain (Comprehensive: 6 entities, Section as weak entity)
  if (lower.includes('school') || lower.includes('university') || lower.includes('college') || (lower.includes('student') && (lower.includes('course') || lower.includes('teacher') || lower.includes('class')))) {
    return {
      entities: [
        {
          name: 'Department',
          isWeak: false,
          attributes: [
            { name: 'DeptCode', attributeType: 'primary', isPrimaryKey: true },
            { name: 'DeptName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Budget', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Instructor',
          isWeak: false,
          attributes: [
            { name: 'InstructorID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'Name', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Email', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Specializations', attributeType: 'multivalued', isPrimaryKey: false },
            { name: 'ExperienceYears', attributeType: 'derived', isPrimaryKey: false }
          ]
        },
        {
          name: 'Course',
          isWeak: false,
          attributes: [
            { name: 'CourseID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'CourseTitle', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Credits', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Section',
          isWeak: true, // Weak Entity: section of course
          attributes: [
            { name: 'SectionNumber', attributeType: 'partial', isPrimaryKey: false },
            { name: 'Semester', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Year', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Student',
          isWeak: false,
          attributes: [
            { name: 'StudentID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'FullName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'GPA', attributeType: 'derived', isPrimaryKey: false },
            { name: 'ContactPhones', attributeType: 'multivalued', isPrimaryKey: false }
          ]
        },
        {
          name: 'Enrollment',
          isWeak: false,
          attributes: [
            { name: 'EnrollmentID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'EnrollDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Grade', attributeType: 'normal', isPrimaryKey: false }
          ]
        }
      ],
      relationships: [
        { from: 'Department', to: 'Course', name: 'Offers', cardinality: '1:N', isIdentifying: false },
        { from: 'Department', to: 'Instructor', name: 'Employs', cardinality: '1:N', isIdentifying: false },
        { from: 'Course', to: 'Section', name: 'Has_Section', cardinality: '1:N', isIdentifying: true },
        { from: 'Instructor', to: 'Section', name: 'Teaches', cardinality: '1:N', isIdentifying: false },
        { from: 'Student', to: 'Enrollment', name: 'Registers', cardinality: '1:N', isIdentifying: false },
        { from: 'Section', to: 'Enrollment', name: 'Contains', cardinality: '1:N', isIdentifying: false }
      ]
    };
  }

  // E-Commerce / Shopping (Comprehensive: 6 entities, OrderItem as weak entity)
  if (lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('shop') || lower.includes('store') || (lower.includes('product') && lower.includes('order'))) {
    return {
      entities: [
        {
          name: 'Customer',
          isWeak: false,
          attributes: [
            { name: 'CustomerID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'CustomerName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Email', attributeType: 'normal', isPrimaryKey: false },
            { name: 'ShippingAddresses', attributeType: 'multivalued', isPrimaryKey: false }
          ]
        },
        {
          name: 'Order',
          isWeak: false,
          attributes: [
            { name: 'OrderID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'OrderDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'OrderStatus', attributeType: 'normal', isPrimaryKey: false },
            { name: 'TotalAmount', attributeType: 'derived', isPrimaryKey: false }
          ]
        },
        {
          name: 'OrderItem',
          isWeak: true, // Weak Entity
          attributes: [
            { name: 'ItemNumber', attributeType: 'partial', isPrimaryKey: false },
            { name: 'Quantity', attributeType: 'normal', isPrimaryKey: false },
            { name: 'UnitPrice', attributeType: 'normal', isPrimaryKey: false },
            { name: 'SubTotal', attributeType: 'derived', isPrimaryKey: false }
          ]
        },
        {
          name: 'Product',
          isWeak: false,
          attributes: [
            { name: 'ProductID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'ProductName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'StockQuantity', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Price', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Tags', attributeType: 'multivalued', isPrimaryKey: false }
          ]
        },
        {
          name: 'Category',
          isWeak: false,
          attributes: [
            { name: 'CategoryID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'CategoryName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Description', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Payment',
          isWeak: false,
          attributes: [
            { name: 'PaymentID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'PaymentMethod', attributeType: 'normal', isPrimaryKey: false },
            { name: 'PaidAmount', attributeType: 'normal', isPrimaryKey: false },
            { name: 'TransactionTime', attributeType: 'normal', isPrimaryKey: false }
          ]
        }
      ],
      relationships: [
        { from: 'Customer', to: 'Order', name: 'Places', cardinality: '1:N', isIdentifying: false },
        { from: 'Order', to: 'OrderItem', name: 'Consists_Of', cardinality: '1:N', isIdentifying: true },
        { from: 'Product', to: 'OrderItem', name: 'Supplies', cardinality: '1:N', isIdentifying: false },
        { from: 'Category', to: 'Product', name: 'Classifies', cardinality: '1:N', isIdentifying: false },
        { from: 'Order', to: 'Payment', name: 'Settles', cardinality: '1:1', isIdentifying: false }
      ]
    };
  }

  // Hospital / Healthcare (Comprehensive: 6 entities, Prescription as weak entity)
  if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('patient') || lower.includes('doctor')) {
    return {
      entities: [
        {
          name: 'Patient',
          isWeak: false,
          attributes: [
            { name: 'PatientID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'PatientName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'DateOfBirth', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Age', attributeType: 'derived', isPrimaryKey: false },
            { name: 'EmergencyContacts', attributeType: 'multivalued', isPrimaryKey: false },
            { name: 'BloodType', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Doctor',
          isWeak: false,
          attributes: [
            { name: 'DoctorID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'DoctorName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Specialization', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Certifications', attributeType: 'multivalued', isPrimaryKey: false }
          ]
        },
        {
          name: 'Department',
          isWeak: false,
          attributes: [
            { name: 'DeptID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'DeptName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'FloorNumber', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Appointment',
          isWeak: false,
          attributes: [
            { name: 'AppointmentID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'AppointmentDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Status', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Symptoms', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Prescription',
          isWeak: true, // Weak Entity
          attributes: [
            { name: 'PrescriptionNo', attributeType: 'partial', isPrimaryKey: false },
            { name: 'Medications', attributeType: 'multivalued', isPrimaryKey: false },
            { name: 'DosageInstructions', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Room',
          isWeak: false,
          attributes: [
            { name: 'RoomNumber', attributeType: 'primary', isPrimaryKey: true },
            { name: 'RoomType', attributeType: 'normal', isPrimaryKey: false },
            { name: 'DailyCharge', attributeType: 'normal', isPrimaryKey: false }
          ]
        }
      ],
      relationships: [
        { from: 'Doctor', to: 'Department', name: 'Belongs_To', cardinality: 'N:1', isIdentifying: false },
        { from: 'Patient', to: 'Appointment', name: 'Schedules', cardinality: '1:N', isIdentifying: false },
        { from: 'Doctor', to: 'Appointment', name: 'Conducts', cardinality: '1:N', isIdentifying: false },
        { from: 'Appointment', to: 'Prescription', name: 'Issues', cardinality: '1:1', isIdentifying: true },
        { from: 'Patient', to: 'Room', name: 'Admitted_To', cardinality: 'N:1', isIdentifying: false }
      ]
    };
  }

  // Banking (Comprehensive: 6 entities)
  if (lower.includes('bank') || lower.includes('account') || lower.includes('transaction')) {
    return {
      entities: [
        {
          name: 'Customer',
          isWeak: false,
          attributes: [
            { name: 'CustomerID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'Name', attributeType: 'normal', isPrimaryKey: false },
            { name: 'SSN', attributeType: 'normal', isPrimaryKey: false },
            { name: 'PhoneNumbers', attributeType: 'multivalued', isPrimaryKey: false }
          ]
        },
        {
          name: 'Branch',
          isWeak: false,
          attributes: [
            { name: 'BranchCode', attributeType: 'primary', isPrimaryKey: true },
            { name: 'BranchName', attributeType: 'normal', isPrimaryKey: false },
            { name: 'City', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Account',
          isWeak: false,
          attributes: [
            { name: 'AccountNumber', attributeType: 'primary', isPrimaryKey: true },
            { name: 'AccountType', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Balance', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Transaction',
          isWeak: true, // Weak Entity: belongs to Account
          attributes: [
            { name: 'TxnNumber', attributeType: 'partial', isPrimaryKey: false },
            { name: 'TxnType', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Amount', attributeType: 'normal', isPrimaryKey: false },
            { name: 'Timestamp', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Loan',
          isWeak: false,
          attributes: [
            { name: 'LoanID', attributeType: 'primary', isPrimaryKey: true },
            { name: 'LoanAmount', attributeType: 'normal', isPrimaryKey: false },
            { name: 'InterestRate', attributeType: 'normal', isPrimaryKey: false }
          ]
        },
        {
          name: 'Card',
          isWeak: false,
          attributes: [
            { name: 'CardNumber', attributeType: 'primary', isPrimaryKey: true },
            { name: 'ExpiryDate', attributeType: 'normal', isPrimaryKey: false },
            { name: 'CVV', attributeType: 'normal', isPrimaryKey: false }
          ]
        }
      ],
      relationships: [
        { from: 'Branch', to: 'Account', name: 'Maintains', cardinality: '1:N', isIdentifying: false },
        { from: 'Customer', to: 'Account', name: 'Holds', cardinality: 'M:N', isIdentifying: false },
        { from: 'Account', to: 'Transaction', name: 'Logs', cardinality: '1:N', isIdentifying: true },
        { from: 'Customer', to: 'Loan', name: 'Applies_For', cardinality: '1:N', isIdentifying: false },
        { from: 'Account', to: 'Card', name: 'Issues', cardinality: '1:N', isIdentifying: false }
      ]
    };
  }

  return null;
}

/**
 * Extract schema from any custom or arbitrary plain text description (richer: up to 6 entities)
 */
function extractGenericSchema(text) {
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'each', 'all',
    'have', 'has', 'had', 'are', 'were', 'can', 'may', 'will', 'database',
    'system', 'application', 'create', 'make', 'diagram', 'model', 'entities',
    'attributes', 'relationships', 'between', 'into', 'some', 'any', 'where',
    'which', 'their', 'there', 'they', 'them', 'about', 'such'
  ]);

  const candidates = [];
  const candidateCounts = {};

  for (const raw of words) {
    const singular = toSingular(raw);
    const key = singular.toLowerCase();
    if (stopWords.has(key) || key.length <= 2) continue;

    if (!candidateCounts[key]) {
      candidateCounts[key] = { name: capitalize(singular), count: 0 };
      candidates.push(key);
    }
    candidateCounts[key].count++;
  }

  const sortedEntities = candidates
    .map(key => candidateCounts[key])
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Up to 6 entities for rich diagrams

  if (sortedEntities.length < 3) {
    sortedEntities.push({ name: 'User', count: 1 });
    sortedEntities.push({ name: 'Item', count: 1 });
    sortedEntities.push({ name: 'Detail', count: 1 });
  }

  const entities = sortedEntities.map((ent, idx) => {
    const name = ent.name;
    const isWeak = idx === sortedEntities.length - 1; // Last one as weak entity example
    return {
      name,
      isWeak,
      attributes: [
        {
          name: isWeak ? `${name}No` : `${name}ID`,
          attributeType: isWeak ? 'partial' : 'primary',
          isPrimaryKey: !isWeak
        },
        { name: 'Name', attributeType: 'normal', isPrimaryKey: false },
        { name: 'CreatedAt', attributeType: 'normal', isPrimaryKey: false },
        { name: 'Tags', attributeType: 'multivalued', isPrimaryKey: false },
        { name: 'Status', attributeType: 'normal', isPrimaryKey: false }
      ]
    };
  });

  const relationships = [];
  for (let i = 0; i < entities.length - 1; i++) {
    const from = entities[i].name;
    const to = entities[i + 1].name;
    const isIdentifying = entities[i + 1].isWeak === true;
    relationships.push({
      from,
      to,
      name: isIdentifying ? `Includes_${to}` : `Relates_${to}`,
      cardinality: i === 0 ? '1:N' : 'M:N',
      isIdentifying
    });
  }

  return { entities, relationships };
}

function toSingular(word) {
  const w = word.trim();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ses') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

function capitalize(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function isValidERModel(data) {
  return (
    data &&
    Array.isArray(data.entities) &&
    data.entities.length > 0 &&
    Array.isArray(data.relationships)
  );
}

function normalizeERModel(data) {
  if (!isValidERModel(data)) {
    throw new Error('Invalid ER model format returned');
  }

  const entities = data.entities.map(e => {
    const entityName = capitalize(toSingular(String(e.name || 'Entity')));
    const isWeak = Boolean(e.isWeak);
    const rawAttrs = Array.isArray(e.attributes) ? e.attributes : [];
    let attributes = rawAttrs.map(a => {
      if (typeof a === 'string') {
        const isPk = a.toLowerCase().includes('id');
        return {
          name: a,
          attributeType: isPk ? 'primary' : 'normal',
          isPrimaryKey: isPk
        };
      }
      let attrType = a.attributeType || (a.isPrimaryKey ? 'primary' : 'normal');
      return {
        name: String(a.name || 'attr'),
        attributeType: attrType,
        isPrimaryKey: attrType === 'primary' || Boolean(a.isPrimaryKey)
      };
    });

    if (!isWeak && !attributes.some(a => a.attributeType === 'primary' || a.isPrimaryKey)) {
      if (attributes.length > 0) {
        attributes[0].attributeType = 'primary';
        attributes[0].isPrimaryKey = true;
      } else {
        attributes.push({ name: `${entityName}ID`, attributeType: 'primary', isPrimaryKey: true });
      }
    }

    return {
      name: entityName,
      isWeak,
      attributes
    };
  });

  const relationships = (data.relationships || [])
    .filter(r => r && r.from && r.to)
    .map(r => {
      const from = capitalize(toSingular(String(r.from)));
      const to = capitalize(toSingular(String(r.to)));
      let card = String(r.cardinality || '1:N').toUpperCase();
      if (!['1:1', '1:N', 'N:1', 'M:N'].includes(card)) {
        card = '1:N';
      }
      return {
        from,
        to,
        name: String(r.name || 'Relates_To').replace(/\s+/g, '_'),
        cardinality: card,
        isIdentifying: Boolean(r.isIdentifying)
      };
    });

  return { entities, relationships };
}
