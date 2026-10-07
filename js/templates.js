// Conteúdo e ordem refletem os arquivos Markdown correspondentes em /docs.
// Um novo modelo pode ser cadastrado aqui sem alterar o renderizador.
export const templates = [
  {
    id: 'modelo-1-a', name: 'Modelo 1', type: 'Tipo A', description: 'Completo e organizado',
    order: ['personal', 'objective', 'education', 'qualifications', 'knowledge', 'strengths', 'experience'],
    objectiveDefault: 'Pleitear uma vaga na empresa referida e atender as necessidades do cargo a ser tratado.',
    educationDefault: 'Ensino médio completo.',
    qualificationsDefault: [{ name: 'Gerente de pessoas', kind: 'Curso livre', hours: '60 horas', completion: '2026-03-16' }],
    knowledgeDefault: ['Informática básica e Pacote Office (Word, Excel e PowerPoint)', 'Gestão de redes sociais (Instagram: Criação de perfil, produção de conteúdo, atração de seguidores e engajamento)', 'Edição básica de fotos e vídeos', 'Criação de artes gráficas no Canvas', 'Atendimento ao público e relacionamento com clientes'],
    strengthsDefault: ['Responsável', 'Competente', 'Proativa', 'Audaciosa']
  },
  {
    id: 'modelo-1-b', name: 'Modelo 1', type: 'Tipo B', description: 'Experiência em destaque',
    order: ['personal', 'objective', 'education', 'experience', 'qualifications', 'knowledge', 'strengths'],
    objectiveDefault: 'Pleitear uma oportunidade profissional na empresa, contribuindo com minhas habilidades, conhecimentos e experiências para atender às necessidades do cargo e colaborar com os objetivos da organização.',
    educationDefault: 'Ensino médio completo.',
    qualificationsDefault: [{ name: 'Gerente de Pessoas', kind: 'Curso livre', hours: '60 horas', completion: '2026-03-16' }],
    knowledgeDefault: ['Informática básica e Pacote Office (Word, Excel e PowerPoint)', 'Gestão de redes sociais (Instagram: criação de perfil, produção de conteúdo, atração de seguidores e engajamento)', 'Edição básica de fotos e vídeos', 'Criação de artes gráficas no Canva', 'Atendimento ao público e relacionamento com clientes'],
    strengthsDefault: ['Responsável', 'Proativa', 'Facilidade de aprendizagem', 'Facilidade de comunicação e relacionamento interpessoal']
  },
  {
    id: 'modelo-2-b', name: 'Modelo 2', type: 'Tipo B', description: 'Ideal para início de carreira',
    order: ['personal', 'objective', 'education', 'qualifications', 'knowledge', 'strengths'],
    objectiveDefault: 'Pleitear uma oportunidade profissional na empresa, contribuindo com minhas habilidades, conhecimentos e qualificações para atender às necessidades do cargo e colaborar com os objetivos da organização.',
    educationDefault: 'Ensino médio em curso',
    qualificationsDefault: [{ name: 'Gerente de Pessoas', kind: 'Curso livre', hours: '60 horas', completion: '2026-03-16' }],
    knowledgeDefault: ['Informática básica e Pacote Office (Word, Excel e PowerPoint)', 'Gestão de redes sociais (Instagram: criação de perfil, produção de conteúdo, atração de seguidores e engajamento)', 'Edição básica de fotos e vídeos', 'Criação de artes gráficas no Canva', 'Atendimento ao público e relacionamento com clientes'],
    strengthsDefault: ['Responsável', 'Proativa', 'Facilidade de aprendizagem', 'Facilidade de comunicação e relacionamento interpessoal']
  },
  {
    id: 'modelo-3-b', name: 'Modelo 3', type: 'Tipo B', description: 'Experiência e competências',
    order: ['personal', 'objective', 'education', 'experience', 'knowledge', 'strengths'],
    objectiveDefault: 'Pleitear uma oportunidade profissional na empresa, contribuindo com minhas habilidades, conhecimentos e qualificações para atender às necessidades do cargo e colaborar com os objetivos da organização.',
    educationDefault: 'Ensino médio em curso',
    knowledgeDefault: ['Informática básica e Pacote Office (Word, Excel e PowerPoint)', 'Gestão de redes sociais (Instagram: criação de perfil, produção de conteúdo, atração de seguidores e engajamento)', 'Edição básica de fotos e vídeos', 'Criação de artes gráficas no Canva', 'Atendimento ao público e relacionamento com clientes'],
    strengthsDefault: ['Responsável', 'Proativa', 'Facilidade de aprendizagem', 'Facilidade de comunicação e relacionamento interpessoal']
  }
];

export const sectionTitles = {
  personal: 'Dados de identificação pessoal', objective: 'Objetivo', education: 'Formação acadêmica',
  experience: 'Experiências profissionais', qualifications: 'Qualificações',
  knowledge: 'Conhecimentos específicos', strengths: 'Habilidades pessoais'
};

export const defaultResume = {
  fullName: '', phone: '', birthDate: '', maritalStatus: '', transport: '', city: '', neighborhood: '', state: '', email: '',
  objective: '', objectiveEnabled: true, education: '',
  experience: [{ company: '', tradeName: '', role: '', contract: '', startDate: '', endDate: '', current: false, phone: '' }],
  qualifications: [{ name: '', kind: '', hours: '', completion: '' }],
  knowledge: [''], strengths: ['']
};
