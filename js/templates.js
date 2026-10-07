// Cada modelo descreve apenas sua apresentação e a ordem das seções.
// Para adicionar um modelo, inclua um novo objeto neste catálogo.
export const templates = [
  {
    id: 'modelo-1-a', name: 'Modelo 1', type: 'Tipo A', description: 'Completo e organizado',
    order: ['personal', 'objective', 'education', 'qualifications', 'knowledge', 'strengths', 'experience']
  },
  {
    id: 'modelo-1-b', name: 'Modelo 1', type: 'Tipo B', description: 'Experiência em destaque',
    order: ['personal', 'objective', 'education', 'experience', 'qualifications', 'knowledge', 'strengths']
  },
  {
    id: 'modelo-2-b', name: 'Modelo 2', type: 'Tipo B', description: 'Ideal para início de carreira',
    order: ['personal', 'objective', 'education', 'qualifications', 'knowledge', 'strengths']
  },
  {
    id: 'modelo-3-b', name: 'Modelo 3', type: 'Tipo B', description: 'Experiência e competências',
    order: ['personal', 'objective', 'education', 'experience', 'knowledge', 'strengths']
  }
];

export const sectionTitles = {
  objective: 'Objetivo', education: 'Formação acadêmica', experience: 'Experiências profissionais',
  qualifications: 'Qualificações', knowledge: 'Conhecimentos específicos', strengths: 'Habilidades pessoais'
};

export const defaultResume = {
  fullName: '', phone: '', birthDate: '', maritalStatus: '', transport: '', city: '', neighborhood: '', state: '', email: '',
  objective: '', education: '',
  experience: [{ company: '', tradeName: '', role: '', contract: '', period: '', phone: '' }],
  qualifications: [{ name: '', kind: '', hours: '', completion: '' }],
  knowledge: [''], strengths: ['']
};
