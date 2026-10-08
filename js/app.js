import { templates, sectionTitles, defaultResume } from './templates.js';

const form = document.querySelector('#resume-form');
const preview = document.querySelector('#resume-content');
const picker = document.querySelector('#template-picker');
const resumeFrame = document.querySelector('#resume-frame');
let previewPage = 1;
let previewPages = 1;
let frameReady = false;
let previewVersion = 0;
let renderedVersion = 0;
let printRequested = false;
resumeFrame.addEventListener('load', () => {
  frameReady = true;
  resumeFrame.contentWindow.postMessage({ type: 'render-resume', version: previewVersion, template: preview.classList[1], content: preview.innerHTML }, '*');
});
resumeFrame.srcdoc = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link rel="stylesheet" href="css/style.css"><style>
html,body{margin:0;padding:0;background:#fff}#source-content{position:absolute;left:-10000px;top:0;width:595px;min-height:0;margin:0;padding:0;box-shadow:none;font-size:12pt;line-height:1.5}#output{display:flex;flex-direction:column;align-items:center;gap:18px}.resume-page{width:210mm;height:297mm;padding:30mm 20mm 20mm;box-sizing:border-box;background:#fff;box-shadow:0 6px 22px #29362914;break-after:page;page-break-after:always}.resume-page:last-child{break-after:auto;page-break-after:auto}.page-content{width:100%;height:100%;display:flex;justify-content:center;overflow:hidden}.page-content .resume-paper{width:100%;max-width:none;height:100%;min-height:0;margin:0;padding:0;box-shadow:none;overflow:hidden;font-size:12pt;line-height:1.5}.resume-section{break-inside:avoid;page-break-inside:avoid}
@media print{@page{size:A4;margin:0}html,body{width:210mm;margin:0;padding:0}#output{display:block}.resume-page{display:block!important;margin:0!important;padding:30mm 20mm 20mm;box-shadow:none;transform:none!important}.page-content .resume-paper{width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;box-shadow:none!important;font-size:12pt!important;line-height:1.5!important}}
</style></head><body><article id="source-content" class="resume-paper"></article><div id="output"></div><script>
let version=0,queue=Promise.resolve();const source=document.querySelector('#source-content'),output=document.querySelector('#output');
function makePage(template){const page=document.createElement('div');page.className='resume-page';const area=document.createElement('div');area.className='page-content';const paper=document.createElement('article');paper.className='resume-paper '+template;area.append(paper);page.append(area);output.append(page);return paper}
function paginate(template){output.replaceChildren();let paper=makePage(template);for(const section of [...source.children]){const item=section.cloneNode(true);paper.append(item);if(paper.scrollHeight>paper.clientHeight+1&&paper.children.length>1){paper.removeChild(item);paper=makePage(template);paper.append(item)}}}
function fitPages(){output.querySelectorAll('.resume-page').forEach(page=>{const scale=Math.min(1,document.documentElement.clientWidth/page.offsetWidth);page.style.transformOrigin='top center';page.style.transform='scale('+scale+')';page.style.marginBottom=(-page.offsetHeight*(1-scale))+'px'})}
window.addEventListener('resize',fitPages);window.addEventListener('message',event=>{const data=event.data||{};if(data.type==='render-resume'){version=data.version;const requestedVersion=version;source.className='resume-paper '+data.template;source.innerHTML=data.content;queue=queue.then(()=>{if(requestedVersion!==version)return;paginate(data.template);fitPages();parent.postMessage({type:'resume-pages',version,total:output.querySelectorAll('.resume-page').length},'*')}).catch(error=>console.error('Falha ao paginar curr?culo',error))}else if(data.type==='focus-page'){output.querySelectorAll('.resume-page')[data.page-1]?.scrollIntoView({behavior:'smooth',block:'start'})}else if(data.type==='print-resume'){queue.then(()=>window.print())}});
window.addEventListener('afterprint',()=>parent.postMessage({type:'resume-printed'},'*'));
</script></body></html>`;
const storageKey = 'curriculo-em-foco-v1';
let saved = readSaved();
let selectedTemplate = templates.some(item => item.id === saved.template) ? saved.template : templates[0].id;
let resume = { ...structuredClone(defaultResume), ...(saved.resume || {}) };
let educationCustomized = Boolean(resume.educationLevel || resume.educationDate || resume.educationCustom || resume.education);

function toISODate(value = '') {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}
function toISOMonth(value = '') {
  if (/^\d{4}-\d{2}/.test(value)) return String(value).slice(0, 7);
  const fullDate = String(value).match(/^\d{2}\/(\d{2})\/(\d{4})$/);
  if (fullDate) return `${fullDate[2]}-${fullDate[1]}`;
  const monthYear = String(value).match(/^(\d{2})\/(\d{4})$/);
  return monthYear ? `${monthYear[2]}-${monthYear[1]}` : '';
}
resume.birthDate = toISODate(resume.birthDate);
resume.educationDate = toISOMonth(resume.educationDate);
resume.qualifications = (resume.qualifications || []).map(item => ({ ...item, completion: toISOMonth(item.completion) }));
resume.experience = (resume.experience || []).map(item => {
  if (item.period && !item.startDate && !item.endDate) {
    const dates = item.period.split(/\s*[-–]\s*/);
    const migrated = { ...item, startDate: toISOMonth(dates[0]), endDate: toISOMonth(dates[1]), current: /atual|agora/i.test(dates[1] || '') };
    delete migrated.period;
    return migrated;
  }
  return { ...item, startDate: toISOMonth(item.startDate), endDate: toISOMonth(item.endDate) };
});
resume.objectiveEnabled ??= true;
resume.strengthsEnabled ??= true;
resume.gender ??= 'ela';
if (!resume.educationLevel) {
  const legacyEducation = resume.education || '';
  const templateEducation = templates.find(item => item.id === selectedTemplate)?.educationDefault || '';
  const sourceEducation = legacyEducation || templateEducation;
  resume.educationLevel = educationLevelFrom(sourceEducation);
  resume.educationCustom ||= '';
  resume.educationCompleted ??= /completo/i.test(sourceEducation);
  resume.educationDate ||= '';
}

function readSaved() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; }
}
function persist() { localStorage.setItem(storageKey, JSON.stringify({ template: selectedTemplate, resume })); }
function xmlEscape(value) { return String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]); }
function valueToXml(key, value) {
  if (Array.isArray(value)) return `<${key} type="array">${value.map(item => valueToXml('item', item)).join('')}</${key}>`;
  if (value && typeof value === 'object') return `<${key} type="object">${Object.entries(value).map(([child, item]) => valueToXml(child, item)).join('')}</${key}>`;
  return `<${key}>${xmlEscape(value ?? '')}</${key}>`;
}
function makeXml() { return `<?xml version="1.0" encoding="UTF-8"?>\n<curriculo-save version="1"><template>${xmlEscape(selectedTemplate)}</template>${valueToXml('resume', resume)}</curriculo-save>`; }
function downloadXml() {
  const blob = new Blob([makeXml()], { type: 'application/xml;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'curriculo.xml'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
function xmlToValue(node) {
  const children = [...node.children];
  if (node.getAttribute('type') === 'array') return children.map(xmlToValue);
  if (node.getAttribute('type') === 'object') return Object.fromEntries(children.map(child => [child.tagName, xmlToValue(child)]));
  if (!children.length) return node.textContent;
  if (children.every(child => child.tagName === 'item')) return children.map(xmlToValue);
  return Object.fromEntries(children.map(child => [child.tagName, xmlToValue(child)]));
}
function importXml(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const xml = new DOMParser().parseFromString(String(reader.result), 'application/xml');
      if (xml.querySelector('parsererror') || xml.documentElement.tagName !== 'curriculo-save' || xml.documentElement.getAttribute('version') !== '1') throw new Error();
      const imported = xmlToValue(xml.documentElement.querySelector(':scope > resume'));
      const template = xml.documentElement.querySelector(':scope > template')?.textContent;
      if (!imported || !templates.some(item => item.id === template) || !Array.isArray(imported.experience) || !Array.isArray(imported.qualifications) || !Array.isArray(imported.knowledge) || !Array.isArray(imported.strengths)) throw new Error();
      resume = { ...structuredClone(defaultResume), ...imported };
      selectedTemplate = template;
      resume.birthDate = toISODate(resume.birthDate); resume.educationDate = toISOMonth(resume.educationDate);
      resume.experience = resume.experience.map(item => ({ ...item, startDate: toISOMonth(item.startDate), endDate: toISOMonth(item.endDate) }));
      resume.qualifications = resume.qualifications.map(item => ({ ...item, completion: toISOMonth(item.completion) }));
      educationCustomized = true;
      renderPicker(); renderForm(); renderPreview(); persist();
    } catch { alert('Não foi possível carregar este XML. Selecione um arquivo de currículo exportado por este site.'); }
  };
  reader.readAsText(file);
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function field(label, path, value, placeholder = '', type = 'text') {
  const displayValue = type === 'tel' ? formatPhone(value) : value;
  return `<label class="field"><span>${label}</span><input type="${type}" data-path="${path}" value="${escapeHtml(displayValue)}" placeholder="${placeholder}" ${type === 'email' ? 'autocomplete="email"' : ''}></label>`;
}
function selectField(label, path, value, options, placeholder = 'Selecione uma opção') {
  return `<label class="field"><span>${label}</span><select class="education-select" data-path="${path}"><option value="">${placeholder}</option>${options.map(option => `<option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
}
function textarea(label, path, value, placeholder = '') {
  return `<label class="field"><span>${label}</span><textarea data-path="${path}" rows="3" placeholder="${placeholder}">${escapeHtml(value)}</textarea></label>`;
}
function formatDate(value) {
  const iso = toISODate(value);
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '';
}
function formatMonthYear(value = '') {
  const month = toISOMonth(value);
  return month ? `${month.slice(5, 7)}/${month.slice(0, 4)}` : '';
}
function adaptGender(text, gender) {
  if (gender !== 'ele') return text;
  const forms = { 'Proativa': 'Proativo', 'proativa': 'proativo', 'Audaciosa': 'Audacioso', 'audaciosa': 'audacioso', 'Responsável': 'Responsável', 'responsável': 'responsável', 'Dedicada': 'Dedicado', 'dedicada': 'dedicado', 'Organizada': 'Organizado', 'organizada': 'organizado', 'Comunicativa': 'Comunicativo', 'comunicativa': 'comunicativo' };
  return text.replace(/Proativa|proativa|Audaciosa|audaciosa|Responsável|responsável|Dedicada|dedicada|Organizada|organizada|Comunicativa|comunicativa/g, word => forms[word]);
}
function formatPhone(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length < 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
function educationCompletionDefault() {
  const template = templates.find(item => item.id === selectedTemplate) || templates[0];
  return /completo/i.test(template.educationDefault || '');
}
function educationLevelFrom(source = '') {
  const educationMap = { 'Ensino fundamental': /fundamental/i, 'Ensino médio': /médio/i, 'Curso técnico': /técnico/i, 'Ensino superior': /superior/i, 'Pós-graduação': /pós/i, Mestrado: /mestrado/i, Doutorado: /doutorado/i };
  return Object.entries(educationMap).find(([, pattern]) => pattern.test(source))?.[0] || '';
}
function objectivePresets() {
  const template = templates.find(item => item.id === selectedTemplate) || templates[0];
  return [
    template.objectiveDefault,
    'Busco uma oportunidade profissional para aplicar minhas habilidades e contribuir com os resultados da equipe.',
    'Tenho interesse em desenvolver minha carreira e colaborar com a empresa com dedicação e responsabilidade.'
  ].filter((text, index, list) => text && list.indexOf(text) === index).map((text, index) => ({
    id: `texto-${index + 1}`,
    text,
    label: `Texto ${index + 1} - ${text.trim().split(/\s+/).slice(0, 7).join(' ')}${text.trim().split(/\s+/).length > 7 ? '…' : ''}`
  }));
}
function topicLegend(number, title, description) {
  return `<legend><span class="topic-title"><span class="section-number">${number}</span>${title}</span><small class="topic-help">${description}</small></legend>`;
}
function renderPicker() {
  picker.innerHTML = templates.map(template => `<button type="button" class="template-card ${selectedTemplate === template.id ? 'is-selected' : ''}" data-template="${template.id}" aria-pressed="${selectedTemplate === template.id}"><span class="template-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="template-meta"><strong>${template.name}</strong><small>${template.type} · ${template.description}</small></span><span class="template-check" aria-hidden="true">✓</span></button>`).join('');
  const notes = {
    'modelo-1-a': 'O Modelo 1A apresenta todas as seções, incluindo qualificações e experiências profissionais.',
    'modelo-1-b': 'O Modelo 1B reúne experiências profissionais e qualificações para apresentar uma trajetória mais completa.',
    'modelo-2-b': 'O Modelo 2B é uma opção para quem ainda não tem experiência profissional. Ele mantém as demais seções e não inclui uma seção de experiências.',
    'modelo-3-b': 'O Modelo 3B é uma opção para quem já tem experiência profissional, mas ainda não fez cursos. Ele destaca a experiência sem incluir uma seção de qualificações.'
  };
  document.querySelector('#template-note').textContent = notes[selectedTemplate] || '';
}
function renderForm() {
  const completed = resume.educationCompleted ?? educationCompletionDefault();
  const educationLevels = ['Ensino fundamental', 'Ensino médio', 'Curso técnico', 'Ensino superior', 'Pós-graduação', 'Mestrado', 'Doutorado', 'Outro'];
  const presets = objectivePresets();
  form.innerHTML = `
    <div class="gender-selector"><label class="field"><span>Gênero para concordância dos textos padrão</span><select class="education-select" data-path="gender"><option value="ele" ${resume.gender === 'ele' ? 'selected' : ''}>Ele/dele</option><option value="ela" ${resume.gender !== 'ele' ? 'selected' : ''}>Ela/dela</option></select></label><p>Essa preferência só ajusta textos sugeridos e não aparece no currículo.</p></div>
    <fieldset class="form-section">${topicLegend('01', 'Dados pessoais', 'Informe seus dados de identificação e contato para que a empresa possa conhecer você.')}
      <div class="field-grid personal-fields">${field('Nome', 'fullName', resume.fullName, 'Seu nome completo')}${field('Celular', 'phone', resume.phone, '(00) 00000-0000', 'tel')}${field('Data de nascimento', 'birthDate', resume.birthDate, '', 'date')}${field('Estado civil', 'maritalStatus', resume.maritalStatus, 'Ex.: solteira')}${selectField('Transportes', 'transport', resume.transport, ['Próprio', 'Público', 'Próprio e público', 'Não possui'])}${field('Cidade', 'city', resume.city, 'Sua cidade')}${field('Bairro', 'neighborhood', resume.neighborhood, 'Seu bairro')}${field('UF', 'state', resume.state, 'Ex.: Mato Grosso do Sul')}${field('E-mail', 'email', resume.email, 'voce@email.com', 'email')}</div>
    </fieldset>
    <fieldset class="form-section">${topicLegend('02', 'Objetivo', 'Conte que tipo de oportunidade procura. Você pode escolher um texto pronto ou escrever o seu.')}<label class="check-field"><input type="checkbox" data-path="objectiveEnabled" ${resume.objectiveEnabled ? 'checked' : ''}><span>Incluir objetivo no currículo</span></label><div class="objective-input" ${resume.objectiveEnabled ? '' : 'hidden'}><label class="field objective-preset-field"><span>Escolha um texto pronto</span><select class="education-select" data-path="objectivePreset"><option value="">Selecione um texto</option>${presets.map(item => `<option value="${item.id}" ${resume.objectivePreset === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></label>${textarea('Texto (pode editar)', 'objective', resume.objective, 'Deixe vazio para usar o texto padrão do modelo.')}</div></fieldset>
    <fieldset class="form-section">${topicLegend('03', 'Formação acadêmica', 'Informe sua escolaridade ou curso. Marque se concluiu ou indique a previsão de conclusão.')}<div class="field-grid education-fields"><label class="field"><span>Nível de formação</span><select class="education-select" data-path="educationLevel"><option value="">Selecione uma opção</option>${educationLevels.map(level => `<option value="${level}" ${resume.educationLevel === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label>${resume.educationLevel === 'Outro' ? field('Descreva a formação', 'educationCustom', resume.educationCustom || '', 'Qual formação?') : ''}<label class="check-field education-check"><input type="checkbox" data-path="educationCompleted" ${completed ? 'checked' : ''}><span>Formação concluída</span></label>${field(completed ? 'Mês e ano de conclusão' : 'Mês e ano previstos', 'educationDate', resume.educationDate || '', '', 'month')}</div></fieldset>
    <fieldset class="form-section">${topicLegend('04', 'Experiências profissionais', 'Inclua empregos, estágios, trabalhos autônomos ou outras experiências relevantes.')}<div id="experience-list">${resume.experience.map((entry, index) => `<div class="repeat-card"><div class="repeat-heading"><strong>Experiência ${index + 1}</strong>${repeatRemove(index, 'experience')}</div><div class="field-grid">${field('Empresa', `experience.${index}.company`, entry.company, 'Nome da empresa')}${field('Nome conhecido (opcional)', `experience.${index}.tradeName`, entry.tradeName, 'Nome fantasia')}${field('Função exercida', `experience.${index}.role`, entry.role, 'Seu cargo ou atividade')}${field('Contrato (opcional)', `experience.${index}.contract`, entry.contract, 'Ex.: estágio')}${field('Mês e ano de início', `experience.${index}.startDate`, entry.startDate, '', 'month')}${field('Mês e ano de término', `experience.${index}.endDate`, entry.endDate, '', 'month')}${field('Telefone (opcional)', `experience.${index}.phone`, entry.phone, '(00) 0000-0000', 'tel')}<label class="check-field"><input type="checkbox" data-path="experience.${index}.current" ${entry.current ? 'checked' : ''}><span>Trabalho atual</span></label></div></div>`).join('')}</div><button type="button" class="add-button" data-add="experience">＋ Adicionar experiência</button></fieldset>
    <fieldset class="form-section">${topicLegend('05', 'Qualificações', 'Você coloca seus cursos profissionalizantes, cursos livres e outras qualificações.')}<div id="qualification-list">${resume.qualifications.map((entry, index) => `<div class="repeat-card"><div class="repeat-heading"><strong>Qualificação ${index + 1}</strong>${repeatRemove(index, 'qualifications')}</div><div class="field-grid">${field('Curso / qualificação', `qualifications.${index}.name`, entry.name, 'Nome do curso')}${field('Instituição ou tipo', `qualifications.${index}.kind`, entry.kind, 'Ex.: curso livre')}${field('Carga horária', `qualifications.${index}.hours`, entry.hours, 'Ex.: 40 horas')}${field('Mês e ano de conclusão', `qualifications.${index}.completion`, entry.completion, '', 'month')}</div></div>`).join('')}</div><button type="button" class="add-button" data-add="qualifications">＋ Adicionar qualificação</button></fieldset>
    ${listSection('knowledge', '06', 'Conhecimentos específicos', resume.knowledge, 'Ex.: Pacote Office')}
    <fieldset class="form-section">${topicLegend('07', 'Habilidades pessoais', 'Destaque qualidades e habilidades comportamentais, como comunicação, organização ou trabalho em equipe.')}<label class="check-field"><input type="checkbox" data-path="strengthsEnabled" ${resume.strengthsEnabled ? 'checked' : ''}><span>Incluir habilidades pessoais no currículo</span></label><div class="strengths-input" ${resume.strengthsEnabled ? '' : 'hidden'}><div id="strengths-list">${resume.strengths.map((item, index) => `<div class="list-row">${field(`Habilidade ${index + 1}`, `strengths.${index}`, item, 'Ex.: Comunicação')}${repeatRemove(index, 'strengths')}</div>`).join('')}</div><button type="button" class="add-button" data-add="strengths">＋ Adicionar item</button></div></fieldset>
  `;
}
function repeatRemove(index, key) { return `<button type="button" class="remove-button" data-remove="${key}" data-index="${index}" aria-label="Remover item">Remover</button>`; }
function listSection(key, number, title, items, placeholder) {
  const description = 'Você pode incluir conhecimentos gerais ou específicos, relacionados ou não à vaga desejada.';
  return `<fieldset class="form-section">${topicLegend(number, title, description)}<div id="${key}-list">${items.map((item, index) => `<div class="list-row">${field(`${title.slice(0, -1)} ${index + 1}`, `${key}.${index}`, item, placeholder)}${repeatRemove(index, key)}</div>`).join('')}</div><button type="button" class="add-button" data-add="${key}">＋ Adicionar item</button></fieldset>`;
}
function getPath(path) { return path.split('.').reduce((obj, key) => obj?.[key], resume); }
function setPath(path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  const target = parts.reduce((obj, key) => obj[key], resume);
  target[last] = value;
}
function hasContent(value) { return typeof value === 'string' ? value.trim().length > 0 : Object.values(value).some(item => typeof item === 'string' && item.trim()); }
function sectionContent(key) {
  const template = templates.find(item => item.id === selectedTemplate) || templates[0];
  if (key === 'personal') {
    const personalItems = [
      ['Nome', resume.fullName || 'Seu nome completo', ''], ['Celular', formatPhone(resume.phone), ''],
      ['Data de nascimento', formatDate(resume.birthDate), 'personal-date'], ['Estado civil', resume.maritalStatus, ''],
      ['Transportes', resume.transport, ''], ['Cidade', resume.city, ''], ['Bairro', resume.neighborhood, ''],
      ['UF', resume.state, ''], ['E-mail', resume.email, '']
    ];
    return `<section class="resume-personal"><h2>${sectionTitles.personal.toUpperCase()}</h2><div class="personal-grid">${personalItems.filter(([, value]) => value?.trim()).map(([label, value, className]) => `<div class="personal-item ${className}">${label}: ${label === 'E-mail' ? `<a href="mailto:${escapeHtml(value)}">${escapeHtml(value)}</a>` : escapeHtml(value)}</div>`).join('')}</div></section>`;
  }
  if (key === 'objective') {
    if (!resume.objectiveEnabled) return '';
    const value = resume.objective.trim() || template.objectiveDefault || '';
    return value ? `<p class="resume-paragraph">${escapeHtml(value).replace(/\n/g, '<br>')}</p>` : '';
  }
  if (key === 'education') {
    const selectedEducation = resume.educationLevel === 'Outro' ? resume.educationCustom : resume.educationLevel;
    if (!selectedEducation) return template.educationDefault ? `<ul><li>${escapeHtml(template.educationDefault)}</li></ul>` : '';
    const status = resume.educationCompleted ?? educationCompletionDefault();
    const dateLabel = status ? 'Conclusão em' : 'Previsão de formação';
    const dateLine = resume.educationDate ? `<p class="resume-detail">${dateLabel}: ${formatMonthYear(resume.educationDate)}</p>` : '';
    return `<ul><li>${escapeHtml(selectedEducation)} ${status ? 'completo' : 'em curso'}${dateLine}</li></ul>`;
  }
  if (key === 'experience') return resume.experience.filter(hasContent).map(item => {
    const period = [formatMonthYear(item.startDate), item.current ? 'Atual' : formatMonthYear(item.endDate)].filter(Boolean).join(' - ');
    return `<div class="resume-entry"><h3>${escapeHtml(item.company || 'Empresa')}${item.tradeName ? ` <span>— ${escapeHtml(item.tradeName)}</span>` : ''}</h3>${[['Contrato', item.contract], ['Função exercida', item.role], ['Tempo de serviço', period], ['Telefone', formatPhone(item.phone)]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}</div>`;
  }).join('');
  if (key === 'qualifications') {
    const entries = resume.qualifications.filter(hasContent);
    const content = entries.length ? entries : template.qualificationsDefault || [];
    return `<ul class="qualification-list">${content.map(item => `<li><strong>${escapeHtml(item.name)}</strong>${item.kind ? ` - ${escapeHtml(item.kind)}` : ''}${[['Carga horária', item.hours], ['Conclusão', formatMonthYear(item.completion)]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p class="resume-detail">${label}: ${escapeHtml(value)}</p>`).join('')}</li>`).join('')}</ul>`;
  }
  if (key === 'knowledge' || key === 'strengths') {
    if (key === 'strengths' && !resume.strengthsEnabled) return '';
    const items = resume[key].filter(item => item.trim());
    const content = items.length ? items : template[`${key}Default`] || [];
    return content.length ? `<ul>${content.map(item => `<li>${escapeHtml(items.length ? item : adaptGender(item, resume.gender))}</li>`).join('')}</ul>` : '';
  }
  return '';
}
function renderPreview() {
  const template = templates.find(item => item.id === selectedTemplate) || templates[0];
  preview.className = `resume-paper ${template.id}`;
  preview.innerHTML = template.order.map(key => {
    const content = sectionContent(key);
    if (!content) return '';
    if (key === 'personal') return content;
    return `<section class="resume-section"><h2>${sectionTitles[key]}</h2>${content}</section>`;
  }).join('');
  previewVersion++;
  if (frameReady) {
    resumeFrame.contentWindow.postMessage({ type: 'render-resume', version: previewVersion, template: template.id, content: preview.innerHTML }, '*');
  }
}
function updatePageNavigation() {
  previewPage = Math.min(previewPage, previewPages);
  document.querySelector('#current-page').textContent = previewPage;
  document.querySelector('#total-pages').textContent = previewPages;
  document.querySelector('#previous-page').disabled = previewPage <= 1;
  document.querySelector('#next-page').disabled = previewPage >= previewPages;
}
window.addEventListener('message', event => {
  if (event.source !== resumeFrame.contentWindow) return;
  const message = event.data || {};
  if (message.type === 'resume-pages' && message.version === previewVersion) {
    renderedVersion = message.version;
    previewPages = Math.max(1, message.total);
    updatePageNavigation();
    if (printRequested) { printRequested = false; resumeFrame.contentWindow.postMessage({ type: 'print-resume' }, '*'); }
  }
  if (message.type === 'resume-printed' && offerXmlAfterPrint) {
    offerXmlAfterPrint = false;
    saveDialog.showModal();
  }
});

picker.addEventListener('click', event => {
  const button = event.target.closest('[data-template]');
  if (!button) return;
  selectedTemplate = button.dataset.template;
  if (!educationCustomized) {
    const template = templates.find(item => item.id === selectedTemplate);
    resume.educationLevel = educationLevelFrom(template.educationDefault);
    resume.educationCompleted = /completo/i.test(template.educationDefault || '');
  }
  renderPicker(); renderForm(); renderPreview(); persist();
});
form.addEventListener('input', event => {
  if (!event.target.matches('[data-path]')) return;
  const path = event.target.dataset.path;
  if (event.target.type === 'tel') event.target.value = formatPhone(event.target.value);
  setPath(path, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
  if (path.startsWith('education')) educationCustomized = true;
  if (path === 'objectivePreset') {
    const preset = objectivePresets().find(item => item.id === resume.objectivePreset);
    if (preset) {
      resume.objective = preset.text;
      form.querySelector('textarea[data-path="objective"]').value = preset.text;
    }
  }
  if (path === 'objective' && resume.objectivePreset) {
    resume.objectivePreset = '';
    form.querySelector('select[data-path="objectivePreset"]').value = '';
  }
  if (event.target.dataset.path === 'objectiveEnabled') form.querySelector('.objective-input').hidden = !resume.objectiveEnabled;
  if (path === 'strengthsEnabled') form.querySelector('.strengths-input').hidden = !resume.strengthsEnabled;
  if (path === 'educationCompleted') {
    const label = form.querySelector('.education-fields .field:last-child > span');
    label.textContent = resume.educationCompleted ? 'Data de conclusão' : 'Previsão de formação';
  }
  if (path === 'educationLevel') { renderForm(); }
  renderPreview(); persist();
});
form.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) {
    const key = add.dataset.add;
    const blank = key === 'experience' ? { company: '', tradeName: '', role: '', contract: '', startDate: '', endDate: '', current: false, phone: '' } : key === 'qualifications' ? { name: '', kind: '', hours: '', completion: '' } : '';
    resume[key].push(blank); renderForm(); renderPreview(); persist(); return;
  }
  const remove = event.target.closest('[data-remove]');
  if (remove) {
    const list = resume[remove.dataset.remove];
    list.splice(Number(remove.dataset.index), 1);
    renderForm(); renderPreview(); persist();
  }
});
const saveDialog = document.querySelector('#save-dialog');
let offerXmlAfterPrint = false;
function printResume() {
  printRequested = true;
  if (frameReady && renderedVersion === previewVersion) {
    printRequested = false;
    resumeFrame.contentWindow.postMessage({ type: 'print-resume' }, '*');
  }
}
document.querySelector('#print-button').addEventListener('click', () => { offerXmlAfterPrint = true; printResume(); });
document.querySelector('#download-button').addEventListener('click', () => { offerXmlAfterPrint = true; printResume(); });
document.querySelector('#save-xml-button').addEventListener('click', () => { downloadXml(); saveDialog.close(); });
document.querySelector('#skip-save-button').addEventListener('click', () => saveDialog.close());
document.querySelector('.dialog-close').addEventListener('click', () => saveDialog.close());
document.querySelector('#upload-button').addEventListener('click', () => document.querySelector('#resume-upload').click());
document.querySelector('#resume-upload').addEventListener('change', event => { if (event.target.files[0]) importXml(event.target.files[0]); event.target.value = ''; });
function navigatePreviewPage(amount) {
  previewPage += amount;
  updatePageNavigation();
  resumeFrame.contentWindow.postMessage({ type: 'focus-page', page: previewPage }, '*');
}
document.querySelector('#previous-page').addEventListener('click', () => navigatePreviewPage(-1));
document.querySelector('#next-page').addEventListener('click', () => navigatePreviewPage(1));
document.querySelector('#year').textContent = new Date().getFullYear();
renderPicker(); renderForm(); renderPreview();
