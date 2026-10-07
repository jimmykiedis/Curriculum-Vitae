import { templates, sectionTitles, defaultResume } from './templates.js';

const form = document.querySelector('#resume-form');
const preview = document.querySelector('#resume-preview');
const picker = document.querySelector('#template-picker');
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
resume.birthDate = toISODate(resume.birthDate);
resume.qualifications = (resume.qualifications || []).map(item => ({ ...item, completion: toISODate(item.completion) }));
resume.experience = (resume.experience || []).map(item => {
  if (item.period && !item.startDate && !item.endDate) {
    const dates = item.period.split(/\s*[-–]\s*/);
    const migrated = { ...item, startDate: toISODate(dates[0]), endDate: toISODate(dates[1]), current: /atual|agora/i.test(dates[1] || '') };
    delete migrated.period;
    return migrated;
  }
  return { ...item, startDate: toISODate(item.startDate), endDate: toISODate(item.endDate) };
});
resume.objectiveEnabled ??= true;
resume.strengthsEnabled ??= true;
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
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function field(label, path, value, placeholder = '', type = 'text') {
  const displayValue = type === 'tel' ? formatPhone(value) : value;
  return `<label class="field"><span>${label}</span><input type="${type}" data-path="${path}" value="${escapeHtml(displayValue)}" placeholder="${placeholder}" ${type === 'email' ? 'autocomplete="email"' : ''}></label>`;
}
function textarea(label, path, value, placeholder = '') {
  return `<label class="field"><span>${label}</span><textarea data-path="${path}" rows="3" placeholder="${placeholder}">${escapeHtml(value)}</textarea></label>`;
}
function formatDate(value) {
  const iso = toISODate(value);
  return iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '';
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
function renderPicker() {
  picker.innerHTML = templates.map(template => `<button type="button" class="template-card ${selectedTemplate === template.id ? 'is-selected' : ''}" data-template="${template.id}" aria-pressed="${selectedTemplate === template.id}"><span class="template-icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="template-meta"><strong>${template.name}</strong><small>${template.type} · ${template.description}</small></span><span class="template-check" aria-hidden="true">✓</span></button>`).join('');
}
function renderForm() {
  const completed = resume.educationCompleted ?? educationCompletionDefault();
  const educationLevels = ['Ensino fundamental', 'Ensino médio', 'Curso técnico', 'Ensino superior', 'Pós-graduação', 'Mestrado', 'Doutorado', 'Outro'];
  form.innerHTML = `
    <fieldset class="form-section"><legend><span class="section-number">01</span> Dados pessoais</legend>
      <div class="field-grid personal-fields">${field('Nome', 'fullName', resume.fullName, 'Seu nome completo')}${field('Celular', 'phone', resume.phone, '(00) 00000-0000', 'tel')}${field('Data de nascimento', 'birthDate', resume.birthDate, '', 'date')}${field('Estado civil', 'maritalStatus', resume.maritalStatus, 'Ex.: solteira')}${field('Transportes', 'transport', resume.transport, 'Ex.: próprio')}${field('Cidade', 'city', resume.city, 'Sua cidade')}${field('Bairro', 'neighborhood', resume.neighborhood, 'Seu bairro')}${field('UF', 'state', resume.state, 'Ex.: Mato Grosso do Sul')}${field('E-mail', 'email', resume.email, 'voce@email.com', 'email')}</div>
    </fieldset>
    <fieldset class="form-section"><legend><span class="section-number">02</span> Objetivo</legend><label class="check-field"><input type="checkbox" data-path="objectiveEnabled" ${resume.objectiveEnabled ? 'checked' : ''}><span>Incluir objetivo no currículo</span></label><div class="objective-input" ${resume.objectiveEnabled ? '' : 'hidden'}>${textarea('Texto personalizado (opcional)', 'objective', resume.objective, 'Deixe vazio para usar o texto sugerido pelo modelo.')}</div></fieldset>
    <fieldset class="form-section"><legend><span class="section-number">03</span> Formação acadêmica</legend><div class="field-grid education-fields"><label class="field"><span>Nível de formação</span><select class="education-select" data-path="educationLevel"><option value="">Selecione uma opção</option>${educationLevels.map(level => `<option value="${level}" ${resume.educationLevel === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label>${resume.educationLevel === 'Outro' ? field('Descreva a formação', 'educationCustom', resume.educationCustom || '', 'Qual formação?') : ''}<label class="check-field education-check"><input type="checkbox" data-path="educationCompleted" ${completed ? 'checked' : ''}><span>Formação concluída</span></label>${field(completed ? 'Data de conclusão' : 'Previsão de formação', 'educationDate', resume.educationDate || '', '', 'date')}</div></fieldset>
    <fieldset class="form-section"><legend><span class="section-number">04</span> Experiências profissionais</legend><div id="experience-list">${resume.experience.map((entry, index) => `<div class="repeat-card"><div class="repeat-heading"><strong>Experiência ${index + 1}</strong>${repeatRemove(index, 'experience')}</div><div class="field-grid">${field('Empresa', `experience.${index}.company`, entry.company, 'Nome da empresa')}${field('Nome conhecido (opcional)', `experience.${index}.tradeName`, entry.tradeName, 'Nome fantasia')}${field('Função exercida', `experience.${index}.role`, entry.role, 'Seu cargo ou atividade')}${field('Contrato (opcional)', `experience.${index}.contract`, entry.contract, 'Ex.: estágio')}${field('Início', `experience.${index}.startDate`, entry.startDate, '', 'date')}${field('Término', `experience.${index}.endDate`, entry.endDate, '', 'date')}${field('Telefone (opcional)', `experience.${index}.phone`, entry.phone, '(00) 0000-0000', 'tel')}<label class="check-field"><input type="checkbox" data-path="experience.${index}.current" ${entry.current ? 'checked' : ''}><span>Trabalho atual</span></label></div></div>`).join('')}</div><button type="button" class="add-button" data-add="experience">＋ Adicionar experiência</button></fieldset>
    <fieldset class="form-section"><legend><span class="section-number">05</span> Qualificações</legend><div id="qualification-list">${resume.qualifications.map((entry, index) => `<div class="repeat-card"><div class="repeat-heading"><strong>Qualificação ${index + 1}</strong>${repeatRemove(index, 'qualifications')}</div><div class="field-grid">${field('Curso / qualificação', `qualifications.${index}.name`, entry.name, 'Nome do curso')}${field('Instituição ou tipo', `qualifications.${index}.kind`, entry.kind, 'Ex.: curso livre')}${field('Carga horária', `qualifications.${index}.hours`, entry.hours, 'Ex.: 40 horas')}${field('Conclusão', `qualifications.${index}.completion`, entry.completion, '', 'date')}</div></div>`).join('')}</div><button type="button" class="add-button" data-add="qualifications">＋ Adicionar qualificação</button></fieldset>
    ${listSection('knowledge', '06', 'Conhecimentos específicos', resume.knowledge, 'Ex.: Pacote Office')}
    <fieldset class="form-section"><legend><span class="section-number">07</span> Habilidades pessoais</legend><label class="check-field"><input type="checkbox" data-path="strengthsEnabled" ${resume.strengthsEnabled ? 'checked' : ''}><span>Incluir habilidades pessoais no currículo</span></label><div class="strengths-input" ${resume.strengthsEnabled ? '' : 'hidden'}><div id="strengths-list">${resume.strengths.map((item, index) => `<div class="list-row">${field(`Habilidade ${index + 1}`, `strengths.${index}`, item, 'Ex.: Comunicação')}${repeatRemove(index, 'strengths')}</div>`).join('')}</div><button type="button" class="add-button" data-add="strengths">＋ Adicionar item</button></div></fieldset>
  `;
}
function repeatRemove(index, key) { return `<button type="button" class="remove-button" data-remove="${key}" data-index="${index}" aria-label="Remover item">Remover</button>`; }
function listSection(key, number, title, items, placeholder) {
  return `<fieldset class="form-section"><legend><span class="section-number">${number}</span> ${title}</legend><div id="${key}-list">${items.map((item, index) => `<div class="list-row">${field(`${title.slice(0, -1)} ${index + 1}`, `${key}.${index}`, item, placeholder)}${repeatRemove(index, key)}</div>`).join('')}</div><button type="button" class="add-button" data-add="${key}">＋ Adicionar item</button></fieldset>`;
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
    const dateLine = resume.educationDate ? `<p class="resume-detail">${dateLabel}: ${formatDate(resume.educationDate)}</p>` : '';
    return `<ul><li>${escapeHtml(selectedEducation)} ${status ? 'completo' : 'em curso'}${dateLine}</li></ul>`;
  }
  if (key === 'experience') return resume.experience.filter(hasContent).map(item => {
    const period = [formatDate(item.startDate), item.current ? 'Atual' : formatDate(item.endDate)].filter(Boolean).join(' - ');
    return `<div class="resume-entry"><h3>${escapeHtml(item.company || 'Empresa')}${item.tradeName ? ` <span>— ${escapeHtml(item.tradeName)}</span>` : ''}</h3>${[['Contrato', item.contract], ['Função exercida', item.role], ['Tempo de serviço', period], ['Telefone', formatPhone(item.phone)]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}</div>`;
  }).join('');
  if (key === 'qualifications') {
    const entries = resume.qualifications.filter(hasContent);
    const content = entries.length ? entries : template.qualificationsDefault || [];
    return `<ul class="qualification-list">${content.map(item => `<li><strong>${escapeHtml(item.name)}</strong>${item.kind ? ` - ${escapeHtml(item.kind)}` : ''}${[['Carga horária', item.hours], ['Conclusão', formatDate(item.completion)]].filter(([, value]) => value?.trim()).map(([label, value]) => `<p class="resume-detail">${label}: ${escapeHtml(value)}</p>`).join('')}</li>`).join('')}</ul>`;
  }
  if (key === 'knowledge' || key === 'strengths') {
    if (key === 'strengths' && !resume.strengthsEnabled) return '';
    const items = resume[key].filter(item => item.trim());
    const content = items.length ? items : template[`${key}Default`] || [];
    return content.length ? `<ul>${content.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
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
}

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
document.querySelector('#print-button').addEventListener('click', () => window.print());
document.querySelector('#year').textContent = new Date().getFullYear();
renderPicker(); renderForm(); renderPreview();
