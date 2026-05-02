export default function AboutCopy() {
  return (
    <div className="about-copy">
      <div className="about-copy__heading">
        <p className="section-label works-label">[ О НАС ]</p>
        <h2>Два человека. Один цельный процесс.</h2>
      </div>
      <div className="about-copy__body">
        <p>
          Мы — небольшая команда из двух человек. Соединяем разработку, интерфейсы и визуальную систему, чтобы быстро
          превращать идеи в понятные цифровые продукты.
        </p>
        <div className="about-system-lines" aria-label="Рабочая система команды">
          <span>01 / идея становится структурой</span>
          <span>02 / структура становится интерфейсом</span>
          <span>03 / интерфейс становится продуктом</span>
        </div>
      </div>
    </div>
  );
}
