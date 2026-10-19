import { Entity, Relationship } from '../types';
import { autoLayoutER } from './layout';

export interface PredefinedTemplate {
  name: string;
  entities: Entity[];
  relationships: Relationship[];
}

export function getPredefinedTemplate(templateName: string): { entities: Entity[]; relationships: Relationship[] } | null {
  const lower = templateName.toLowerCase();

  if (lower.includes('commerce') || lower.includes('shop')) {
    const entities: Entity[] = [
      {
        id: 'ent_cust',
        name: 'Customer',
        isWeak: false,
        x: 250,
        y: 200,
        attributes: [
          { id: 'a_c1', name: 'CustomerID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_c2', name: 'FullName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_c3', name: 'Email', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_c4', name: 'PhoneNumbers', isPrimaryKey: false, attributeType: 'multivalued', offsetX: -95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_ord',
        name: 'Order',
        isWeak: false,
        x: 600,
        y: 200,
        attributes: [
          { id: 'a_o1', name: 'OrderID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_o2', name: 'OrderDate', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_o3', name: 'OrderStatus', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_o4', name: 'TotalAmount', isPrimaryKey: false, attributeType: 'derived', offsetX: -95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_item',
        name: 'OrderItem',
        isWeak: true, // Weak Entity
        x: 950,
        y: 200,
        attributes: [
          { id: 'a_i1', name: 'ItemNumber', isPrimaryKey: false, attributeType: 'partial', offsetX: 0, offsetY: -95 },
          { id: 'a_i2', name: 'Quantity', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_i3', name: 'UnitPrice', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_i4', name: 'SubTotal', isPrimaryKey: false, attributeType: 'derived', offsetX: -95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_prod',
        name: 'Product',
        isWeak: false,
        x: 950,
        y: 520,
        attributes: [
          { id: 'a_p1', name: 'ProductID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: 95 },
          { id: 'a_p2', name: 'ProductName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_p3', name: 'Price', isPrimaryKey: false, attributeType: 'normal', offsetX: -95, offsetY: 60 },
          { id: 'a_p4', name: 'Tags', isPrimaryKey: false, attributeType: 'multivalued', offsetX: 95, offsetY: -60 }
        ]
      },
      {
        id: 'ent_cat',
        name: 'Category',
        isWeak: false,
        x: 600,
        y: 520,
        attributes: [
          { id: 'a_cat1', name: 'CategoryID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: 95 },
          { id: 'a_cat2', name: 'CategoryName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_cat3', name: 'Description', isPrimaryKey: false, attributeType: 'normal', offsetX: -95, offsetY: 60 }
        ]
      }
    ];

    const relationships: Relationship[] = [
      { id: 'r1', name: 'Places', fromEntityId: 'ent_cust', toEntityId: 'ent_ord', cardinality: '1:N', isIdentifying: false },
      { id: 'r2', name: 'Consists_Of', fromEntityId: 'ent_ord', toEntityId: 'ent_item', cardinality: '1:N', isIdentifying: true },
      { id: 'r3', name: 'Supplies', fromEntityId: 'ent_prod', toEntityId: 'ent_item', cardinality: '1:N', isIdentifying: false },
      { id: 'r4', name: 'Classifies', fromEntityId: 'ent_cat', toEntityId: 'ent_prod', cardinality: '1:N', isIdentifying: false }
    ];

    return { entities: autoLayoutER(entities, relationships), relationships };
  }

  if (lower.includes('university') || lower.includes('course') || lower.includes('school')) {
    const entities: Entity[] = [
      {
        id: 'ent_dept',
        name: 'Department',
        isWeak: false,
        x: 250,
        y: 200,
        attributes: [
          { id: 'a_d1', name: 'DeptCode', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_d2', name: 'DeptName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_d3', name: 'Budget', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_crs',
        name: 'Course',
        isWeak: false,
        x: 600,
        y: 200,
        attributes: [
          { id: 'a_cr1', name: 'CourseID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_cr2', name: 'CourseTitle', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_cr3', name: 'Credits', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_sec',
        name: 'Section',
        isWeak: true, // Weak Entity
        x: 950,
        y: 200,
        attributes: [
          { id: 'a_s1', name: 'SectionNumber', isPrimaryKey: false, attributeType: 'partial', offsetX: 0, offsetY: -95 },
          { id: 'a_s2', name: 'Semester', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_s3', name: 'Year', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_inst',
        name: 'Instructor',
        isWeak: false,
        x: 250,
        y: 520,
        attributes: [
          { id: 'a_in1', name: 'InstructorID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: 95 },
          { id: 'a_in2', name: 'Name', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_in3', name: 'Specializations', isPrimaryKey: false, attributeType: 'multivalued', offsetX: -95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_stu',
        name: 'Student',
        isWeak: false,
        x: 950,
        y: 520,
        attributes: [
          { id: 'a_st1', name: 'StudentID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: 95 },
          { id: 'a_st2', name: 'FullName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
          { id: 'a_st3', name: 'GPA', isPrimaryKey: false, attributeType: 'derived', offsetX: -95, offsetY: 60 }
        ]
      }
    ];

    const relationships: Relationship[] = [
      { id: 'r1', name: 'Offers', fromEntityId: 'ent_dept', toEntityId: 'ent_crs', cardinality: '1:N', isIdentifying: false },
      { id: 'r2', name: 'Has_Section', fromEntityId: 'ent_crs', toEntityId: 'ent_sec', cardinality: '1:N', isIdentifying: true },
      { id: 'r3', name: 'Employs', fromEntityId: 'ent_dept', toEntityId: 'ent_inst', cardinality: '1:N', isIdentifying: false },
      { id: 'r4', name: 'Teaches', fromEntityId: 'ent_inst', toEntityId: 'ent_sec', cardinality: '1:N', isIdentifying: false },
      { id: 'r5', name: 'Enrolls', fromEntityId: 'ent_stu', toEntityId: 'ent_sec', cardinality: 'M:N', isIdentifying: false }
    ];

    return { entities: autoLayoutER(entities, relationships), relationships };
  }

  if (lower.includes('hospital') || lower.includes('patient') || lower.includes('doctor')) {
    const entities: Entity[] = [
      {
        id: 'ent_doc',
        name: 'Doctor',
        isWeak: false,
        x: 250,
        y: 200,
        attributes: [
          { id: 'a_doc1', name: 'DoctorID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_doc2', name: 'DoctorName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_doc3', name: 'Specialization', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_pat',
        name: 'Patient',
        isWeak: false,
        x: 600,
        y: 200,
        attributes: [
          { id: 'a_pat1', name: 'PatientID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_pat2', name: 'PatientName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_pat3', name: 'Age', isPrimaryKey: false, attributeType: 'derived', offsetX: 95, offsetY: 60 },
          { id: 'a_pat4', name: 'EmergencyContacts', isPrimaryKey: false, attributeType: 'multivalued', offsetX: -95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_app',
        name: 'Appointment',
        isWeak: false,
        x: 950,
        y: 200,
        attributes: [
          { id: 'a_app1', name: 'AppointmentID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
          { id: 'a_app2', name: 'AppointmentDate', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
          { id: 'a_app3', name: 'Status', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 }
        ]
      },
      {
        id: 'ent_pres',
        name: 'Prescription',
        isWeak: true, // Weak Entity
        x: 950,
        y: 520,
        attributes: [
          { id: 'a_pr1', name: 'PrescriptionNo', isPrimaryKey: false, attributeType: 'partial', offsetX: 0, offsetY: 95 },
          { id: 'a_pr2', name: 'Medications', isPrimaryKey: false, attributeType: 'multivalued', offsetX: 95, offsetY: 60 },
          { id: 'a_pr3', name: 'Dosage', isPrimaryKey: false, attributeType: 'normal', offsetX: -95, offsetY: 60 }
        ]
      }
    ];

    const relationships: Relationship[] = [
      { id: 'r1', name: 'Conducts', fromEntityId: 'ent_doc', toEntityId: 'ent_app', cardinality: '1:N', isIdentifying: false },
      { id: 'r2', name: 'Schedules', fromEntityId: 'ent_pat', toEntityId: 'ent_app', cardinality: '1:N', isIdentifying: false },
      { id: 'r3', name: 'Issues', fromEntityId: 'ent_app', toEntityId: 'ent_pres', cardinality: '1:1', isIdentifying: true }
    ];

    return { entities: autoLayoutER(entities, relationships), relationships };
  }

  // Library
  const entities: Entity[] = [
    {
      id: 'ent_bk',
      name: 'Book',
      isWeak: false,
      x: 250,
      y: 200,
      attributes: [
        { id: 'a_b1', name: 'ISBN', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
        { id: 'a_b2', name: 'Title', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 },
        { id: 'a_b3', name: 'Genre', isPrimaryKey: false, attributeType: 'multivalued', offsetX: 95, offsetY: 60 }
      ]
    },
    {
      id: 'ent_aut',
      name: 'Author',
      isWeak: false,
      x: 600,
      y: 200,
      attributes: [
        { id: 'a_au1', name: 'AuthorID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: -95 },
        { id: 'a_au2', name: 'FullName', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: -60 }
      ]
    },
    {
      id: 'ent_mem',
      name: 'Member',
      isWeak: false,
      x: 250,
      y: 520,
      attributes: [
        { id: 'a_m1', name: 'MemberID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: 95 },
        { id: 'a_m2', name: 'Name', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
        { id: 'a_m3', name: 'PhoneNumbers', isPrimaryKey: false, attributeType: 'multivalued', offsetX: -95, offsetY: 60 }
      ]
    },
    {
      id: 'ent_loan',
      name: 'Loan',
      isWeak: false,
      x: 600,
      y: 520,
      attributes: [
        { id: 'a_l1', name: 'LoanID', isPrimaryKey: true, attributeType: 'primary', offsetX: 0, offsetY: 95 },
        { id: 'a_l2', name: 'IssueDate', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 },
        { id: 'a_l3', name: 'DurationDays', isPrimaryKey: false, attributeType: 'derived', offsetX: -95, offsetY: 60 }
      ]
    },
    {
      id: 'ent_fine',
      name: 'Fine',
      isWeak: true, // Weak Entity
      x: 950,
      y: 520,
      attributes: [
        { id: 'a_f1', name: 'FineNumber', isPrimaryKey: false, attributeType: 'partial', offsetX: 0, offsetY: 95 },
        { id: 'a_f2', name: 'Amount', isPrimaryKey: false, attributeType: 'normal', offsetX: 95, offsetY: 60 }
      ]
    }
  ];

  const relationships: Relationship[] = [
    { id: 'r1', name: 'Writes', fromEntityId: 'ent_aut', toEntityId: 'ent_bk', cardinality: 'M:N', isIdentifying: false },
    { id: 'r2', name: 'Borrows', fromEntityId: 'ent_mem', toEntityId: 'ent_loan', cardinality: '1:N', isIdentifying: false },
    { id: 'r3', name: 'Includes', fromEntityId: 'ent_bk', toEntityId: 'ent_loan', cardinality: '1:N', isIdentifying: false },
    { id: 'r4', name: 'Incurs', fromEntityId: 'ent_loan', toEntityId: 'ent_fine', cardinality: '1:1', isIdentifying: true }
  ];

  return { entities: autoLayoutER(entities, relationships), relationships };
}
