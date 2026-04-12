import {
  DoctorOption,
  PatientOption,
} from "../../bll/interfaces/IReferenceDataService";
import {
  ExaminationDetails,
  ExaminationInput,
  ExaminationSummary,
} from "../../bll/interfaces/IExaminationService";
import { escapeHtml, renderLayout } from "./layout";

interface ListOptions {
  examinations: ExaminationSummary[];
  message?: string | null;
}

interface FormOptions {
  mode: "create" | "edit";
  patients: PatientOption[];
  doctors: DoctorOption[];
  values: Partial<ExaminationInput>;
  errorMessage?: string | null;
  examinationId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Заплановано",
  in_progress: "В процесі",
  completed: "Завершено",
  cancelled: "Скасовано",
};

const TYPE_LABELS: Record<string, string> = {
  blood_test: "Аналіз крові",
  mri: "МРТ",
};

export function renderExaminationListPage(options: ListOptions): string {
  const total = options.examinations.length;
  const completed = options.examinations.filter((item) => item.status === "completed").length;
  const inProgress = options.examinations.filter((item) => item.status === "in_progress").length;

  const messageMarkup = options.message
    ? `<div class="message success">${escapeHtml(options.message)}</div>`
    : "";

  const rows = options.examinations
    .map(
      (examination) => `<tr>
        <td data-label="Пацієнт">
          <strong>${escapeHtml(examination.patientName)}</strong><br />
          <span class="muted">${escapeHtml(examination.id)}</span>
        </td>
        <td data-label="Тип"><span class="chip">${escapeHtml(TYPE_LABELS[examination.examinationType])}</span></td>
        <td data-label="Дата">${escapeHtml(examination.date)}</td>
        <td data-label="Лікар">${escapeHtml(examination.doctorName)}</td>
        <td data-label="Статус">${escapeHtml(STATUS_LABELS[examination.status])}</td>
        <td data-label="Результат">${escapeHtml(examination.resultType ?? "Немає")}</td>
        <td data-label="Дії">
          <a class="button secondary" href="/examinations/${encodeURIComponent(examination.id)}">Переглянути</a>
        </td>
      </tr>`,
    )
    .join("");

  const emptyState = `<div class="card"><div class="card-body"><p>У базі поки немає обстежень. Додайте перший запис через форму.</p></div></div>`;

  return renderLayout({
    title: "Медичні обстеження",
    subtitle: "Список, перегляд і редагування обстежень пацієнтів.",
    body: `${messageMarkup}
      <section class="stats">
        <article class="stat">
          <strong>${total}</strong>
          <span>усього обстежень</span>
        </article>
        <article class="stat">
          <strong>${completed}</strong>
          <span>завершених</span>
        </article>
        <article class="stat">
          <strong>${inProgress}</strong>
          <span>в активній роботі</span>
        </article>
      </section>
      ${
        total === 0
          ? emptyState
          : `<section class="card">
              <div class="card-body">
                <table>
                  <thead>
                    <tr>
                      <th>Пацієнт</th>
                      <th>Тип</th>
                      <th>Дата</th>
                      <th>Лікар</th>
                      <th>Статус</th>
                      <th>Результат</th>
                      <th>Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows}
                  </tbody>
                </table>
              </div>
            </section>`
      }`,
  });
}

export function renderExaminationDetailsPage(
  examination: ExaminationDetails,
  message?: string | null,
): string {
  const messageMarkup = message
    ? `<div class="message success">${escapeHtml(message)}</div>`
    : "";

  return renderLayout({
    title: "Картка обстеження",
    subtitle: "Повна інформація про обстеження, пацієнта, лікаря та результат.",
    body: `${messageMarkup}
      <section class="card">
        <div class="card-body">
          <div class="detail-grid">
            ${renderDetail("ID обстеження", examination.id)}
            ${renderDetail("Пацієнт", examination.patientName)}
            ${renderDetail("Дата народження", examination.patientDateOfBirth)}
            ${renderDetail("Лікар", examination.doctorName)}
            ${renderDetail("Спеціалізація", examination.doctorSpecialization)}
            ${renderDetail("Дата обстеження", examination.date)}
            ${renderDetail("Статус", STATUS_LABELS[examination.status])}
            ${renderDetail("Тип", TYPE_LABELS[examination.examinationType])}
            ${renderDetail("Тип результату", examination.resultType ?? "Немає")}
            ${renderDetail("Створено результат", examination.resultCreatedAt ?? "Немає")}
            ${renderDetail("Файл результату", examination.resultFilePath ?? "Немає")}
            ${renderDetail("Медична картка", examination.medicalRecordId ?? "Немає")}
            ${
              examination.examinationType === "blood_test"
                ? renderDetail("Тип зразка", examination.sampleType ?? "Немає")
                : renderDetail("Зона сканування", examination.scanRegion ?? "Немає")
            }
          </div>
          <div class="actions">
            <a class="button primary" href="/examinations/${encodeURIComponent(examination.id)}/edit">Редагувати</a>
            <a class="button secondary" href="/examinations">Повернутися до списку</a>
            <form class="inline-form" method="post" action="/examinations/${encodeURIComponent(examination.id)}/delete">
              <button class="danger" type="submit" onclick="return confirm('Видалити це обстеження?')">Видалити</button>
            </form>
          </div>
        </div>
      </section>`,
  });
}

export function renderExaminationFormPage(options: FormOptions): string {
  const isEdit = options.mode === "edit";
  const selectedType = options.values.examinationType ?? "blood_test";
  const selectedStatus = options.values.status ?? "scheduled";
  const defaultResultType = options.values.resultType ?? defaultResultTypeByExam(selectedType);
  const formAction = isEdit
    ? `/examinations/${encodeURIComponent(options.examinationId ?? "")}/update`
    : "/examinations";
  const submitLabel = isEdit ? "Зберегти зміни" : "Створити обстеження";
  const title = isEdit ? "Редагування обстеження" : "Нове обстеження";
  const subtitle = isEdit
    ? "Оновіть дані обстеження через форму."
    : "Заповніть основні дані для нового обстеження.";
  const errorMarkup = options.errorMessage
    ? `<div class="message error">${escapeHtml(options.errorMessage)}</div>`
    : "";

  return renderLayout({
    title,
    subtitle,
    body: `${errorMarkup}
      <section class="card">
        <div class="card-body">
          <form method="post" action="${formAction}">
            <div class="form-grid">
              <div>
                <label for="patientId">Пацієнт</label>
                <select id="patientId" name="patientId" required>
                  ${renderPatientOptions(options.patients, options.values.patientId)}
                </select>
                <div class="field-note">Пацієнти з наявними медичними картками.</div>
              </div>
              <div>
                <label for="doctorId">Лікар</label>
                <select id="doctorId" name="doctorId" required>
                  ${renderDoctorOptions(options.doctors, options.values.doctorId)}
                </select>
              </div>
              <div>
                <label for="date">Дата обстеження</label>
                <input id="date" name="date" type="date" required value="${escapeAttribute(options.values.date ?? "")}" />
              </div>
              <div>
                <label for="status">Статус</label>
                <select id="status" name="status" required>
                  ${renderStatusOptions(selectedStatus)}
                </select>
              </div>
              <div>
                <label for="examinationType">Тип обстеження</label>
                <select id="examinationType" name="examinationType" required data-exam-type>
                  ${renderTypeOptions(selectedType)}
                </select>
              </div>
              <div data-sample-field style="${selectedType === "blood_test" ? "" : "display:none;"}">
                <label for="sampleType">Тип зразка</label>
                <input id="sampleType" name="sampleType" type="text" value="${escapeAttribute(options.values.sampleType ?? "")}" />
              </div>
              <div data-region-field style="${selectedType === "mri" ? "" : "display:none;"}">
                <label for="scanRegion">Зона сканування</label>
                <input id="scanRegion" name="scanRegion" type="text" value="${escapeAttribute(options.values.scanRegion ?? "")}" />
              </div>
              <div>
                <label for="resultType">Тип результату</label>
                <input id="resultType" name="resultType" type="text" value="${escapeAttribute(defaultResultType)}" />
              </div>
              <div>
                <label for="resultCreatedAt">Створення результату</label>
                <input id="resultCreatedAt" name="resultCreatedAt" type="datetime-local" value="${escapeAttribute(options.values.resultCreatedAt ?? "")}" />
              
              </div>
            </div>
            <div class="actions">
              <button class="primary" type="submit">${submitLabel}</button>
              <a class="button secondary" href="${isEdit && options.examinationId ? `/examinations/${encodeURIComponent(options.examinationId)}` : "/examinations"}">Скасувати</a>
            </div>
          </form>
        </div>
      </section>
      <script>
        const typeSelect = document.querySelector('[data-exam-type]');
        const sampleField = document.querySelector('[data-sample-field]');
        const regionField = document.querySelector('[data-region-field]');
        const resultTypeInput = document.getElementById('resultType');
        const syncFields = () => {
          const value = typeSelect.value;
          const isBlood = value === 'blood_test';
          sampleField.style.display = isBlood ? '' : 'none';
          regionField.style.display = isBlood ? 'none' : '';
          if (!resultTypeInput.value || resultTypeInput.dataset.autofill === 'true') {
            resultTypeInput.value = isBlood ? 'blood_analysis' : 'mri_scan';
            resultTypeInput.dataset.autofill = 'true';
          }
        };
        resultTypeInput.dataset.autofill = '${options.values.resultType ? "false" : "true"}';
        resultTypeInput.addEventListener('input', () => {
          resultTypeInput.dataset.autofill = 'false';
        });
        typeSelect.addEventListener('change', syncFields);
        syncFields();
      </script>`,
  });
}

export function renderNotFoundPage(): string {
  return renderLayout({
    title: "Запис не знайдено",
    subtitle: "Схоже, що обстеження було видалене або ідентифікатор введено помилково.",
    body: `<section class="card"><div class="card-body"><a class="button secondary" href="/examinations">Повернутися до списку</a></div></section>`,
  });
}

function renderPatientOptions(patients: PatientOption[], selectedValue?: string): string {
  return patients
    .map((patient) => {
      const selected = patient.id === selectedValue ? "selected" : "";
      const recordSuffix = patient.medicalRecordId ? `, картка ${patient.medicalRecordId}` : "";
      return `<option value="${escapeAttribute(patient.id)}" ${selected}>${escapeHtml(patient.name + recordSuffix)}</option>`;
    })
    .join("");
}

function renderDoctorOptions(doctors: DoctorOption[], selectedValue?: string): string {
  return doctors
    .map((doctor) => {
      const selected = doctor.id === selectedValue ? "selected" : "";
      return `<option value="${escapeAttribute(doctor.id)}" ${selected}>${escapeHtml(`${doctor.name} (${doctor.specialization})`)}</option>`;
    })
    .join("");
}

function renderStatusOptions(selectedValue: string): string {
  return Object.entries(STATUS_LABELS)
    .map(([value, label]) => {
      const selected = value === selectedValue ? "selected" : "";
      return `<option value="${value}" ${selected}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function renderTypeOptions(selectedValue: string): string {
  return Object.entries(TYPE_LABELS)
    .map(([value, label]) => {
      const selected = value === selectedValue ? "selected" : "";
      return `<option value="${value}" ${selected}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function renderDetail(label: string, value: string): string {
  return `<article class="detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function defaultResultTypeByExam(examinationType: string): string {
  return examinationType === "mri" ? "mri_scan" : "blood_analysis";
}
