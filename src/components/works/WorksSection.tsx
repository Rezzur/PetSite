import { Code2, ExternalLink } from 'lucide-react';
import coinhubPreview from '../../assets/works/coinhub.png';
import pantryFlowLogo from '../../assets/works/pantry-flow-logo.svg';
import prManagementPreview from '../../assets/works/pr-management.png';
import premiumInterfacePreview from '../../assets/works/premium-interface-os.png';

type ProjectCard = {
  id: string;
  number: string;
  title: string;
  type: string;
  description: string;
  image: string;
  imageAlt: string;
  logo?: string;
  logoAlt?: string;
  siteHref?: string;
  sourceHref?: string;
};

const projects: ProjectCard[] = [
  {
    id: 'premium-interface-os',
    number: '01',
    title: 'Premium Interface OS',
    type: 'Интерактивное портфолио UI-концептов',
    description: 'Демонстрационный сайт с премиальными интерфейсами, анимациями и полноэкранными сценариями для product landing, terminal UI и dashboard-дизайна.',
    image: premiumInterfacePreview,
    imageAlt: 'Первый экран проекта Premium Interface OS с продуктовым лендингом Sony WH-1000 XM6',
    siteHref: 'https://sxz.vercel.app/'
  },
  {
    id: 'pr-management',
    number: '02',
    title: 'PR Management',
    type: 'SaaS-инструмент для PR-стратегий',
    description: 'Веб-приложение для создания PR-идей и сценариев под бренд, инфоповод и целевую аудиторию. Личный аккаунт сохраняет сценарии и настройки.',
    image: prManagementPreview,
    imageAlt: 'Экран входа в PR Management с формой авторизации',
    siteHref: 'https://pr-management-lac.vercel.app/'
  },
  {
    id: 'coinhub',
    number: '03',
    title: 'CoinHub',
    type: 'Финтех-сервис обмена криптовалют',
    description: 'Сервис для обмена цифровых активов с прозрачным расчетом курса, комиссии, резерва и итоговой суммы. Интерфейс ведет пользователя от выбора валют до заявки.',
    image: coinhubPreview,
    imageAlt: 'Главный экран CoinHub с формой обмена криптовалют',
    siteHref: 'https://coinhubs.net/'
  },
  {
    id: 'pantry-flow',
    number: '04',
    title: 'Pantry Flow',
    type: 'Android-приложение для учета запасов',
    description: 'Мобильное приложение помогает вести учет продуктов и автоматически формирует список покупок по минимальному остатку. Работает офлайн и хранит данные на устройстве.',
    image: pantryFlowLogo,
    imageAlt: 'Логотип Android-приложения Pantry Flow',
    sourceHref: 'https://github.com/Maks-Troshin/Maks-Troshin-PantryFlow'
  }
];

export default function WorksSection() {
  return (
    <section aria-labelledby="works-title" className="works-section" id="works">
      <div className="works-grid">
        <div className="works-heading">
          <p className="section-label works-label">[ ПРИМЕРЫ РАБОТ ]</p>
          <h2 id="works-title">Проекты, которые мы сделали для клиентов.</h2>
        </div>

        <div className="works-cards" aria-label="Примеры работ">
          {projects.map((project) => (
            <article className={`work-project-card work-project-card--${project.id}`} key={project.id}>
              <div className={`work-preview work-preview--shot work-preview--${project.id}`}>
                <img className="work-preview__image" alt={project.imageAlt} loading="lazy" src={project.image} />
                {project.logo ? (
                  <div className="work-preview__logo-badge">
                    <img alt={project.logoAlt ?? `${project.title} logo`} src={project.logo} />
                  </div>
                ) : null}
              </div>

              <div className="work-project-card__title-row">
                <span className="work-project-card__number">{project.number}</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.type}</p>
                </div>
              </div>

              <p className="work-project-card__description">{project.description}</p>

              <div className="work-project-card__actions" aria-label="Ссылки проекта">
                {project.sourceHref ? (
                  <a className="work-project-card__button" href={project.sourceHref} rel="noreferrer" target="_blank">
                    <Code2 aria-hidden="true" size={19} strokeWidth={1.8} />
                    <span>Исходный код</span>
                  </a>
                ) : null}

                {project.siteHref ? (
                  <a className="work-project-card__button" href={project.siteHref} rel="noreferrer" target="_blank">
                    <span>Сайт</span>
                    <ExternalLink aria-hidden="true" size={18} strokeWidth={1.8} />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
