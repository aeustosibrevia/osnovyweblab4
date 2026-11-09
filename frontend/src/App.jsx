import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2, Plus, Search, Pencil, Trash2, X, MapPin, BedDouble,
  Ruler, UserRound, Phone, Wallet, Layers3, RefreshCw, Home,
  ArrowUpRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { apartmentApi } from './api.js';

const emptyForm = {
  district: '',
  address: '',
  floor: '',
  area: '',
  rooms: '',
  ownerName: '',
  ownerPhone: '',
  price: ''
};

const fields = [
  { name: 'district', label: 'Район', placeholder: 'Наприклад, Шевченківський', type: 'text' },
  { name: 'address', label: 'Адреса', placeholder: 'Вулиця, будинок, квартира', type: 'text' },
  { name: 'floor', label: 'Поверх', placeholder: '5', type: 'number', min: 1, max: 100 },
  { name: 'area', label: 'Площа, м²', placeholder: '65.5', type: 'number', min: 0.1, step: 0.1 },
  { name: 'rooms', label: 'Кількість кімнат', placeholder: '2', type: 'number', min: 1, max: 20 },
  { name: 'ownerName', label: 'ПІБ власника', placeholder: 'Ім’я та прізвище', type: 'text' },
  { name: 'ownerPhone', label: 'Телефон власника', placeholder: '+380 00 000 00 00', type: 'tel' },
  { name: 'price', label: 'Ціна, $', placeholder: '85000', type: 'number', min: 1, step: 1 }
];

const money = (value) => new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(value);

function ApartmentModal({ apartment, onClose, onSave }) {
  const [form, setForm] = useState(apartment ? {
    district: apartment.district,
    address: apartment.address,
    floor: apartment.floor,
    area: apartment.area,
    rooms: apartment.rooms,
    ownerName: apartment.ownerName,
    ownerPhone: apartment.ownerPhone,
    price: apartment.price
  } : emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const required = Object.entries(form).every(([, value]) => String(value).trim() !== '');
    if (!required) {
      setError('Заповніть усі поля');
      return;
    }

    if (Number(form.floor) < 1 || Number(form.floor) > 100 ||
        Number(form.rooms) < 1 || Number(form.rooms) > 20 ||
        Number(form.area) <= 0 || Number(form.price) <= 0) {
      setError('Перевірте числові значення полів');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        floor: Number(form.floor),
        area: Number(form.area),
        rooms: Number(form.rooms),
        price: Number(form.price)
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{apartment ? 'РЕДАГУВАННЯ ЗАПИСУ' : 'НОВИЙ ОБ’ЄКТ'}</span>
            <h2>{apartment ? 'Редагувати квартиру' : 'Додати квартиру'}</h2>
            <p>Вкажіть характеристики об’єкта та контактні дані власника.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Закрити"><X size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            {fields.map((field) => (
              <label className="field" key={field.name}>
                <span>{field.label}</span>
                <input
                  name={field.name}
                  type={field.type}
                  value={form[field.name]}
                  onChange={updateField}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  required
                />
              </label>
            ))}
          </div>
          {error && <div className="form-error"><AlertCircle size={16} />{error}</div>}
          <div className="modal-actions">
            <button type="button" className="button button-ghost" onClick={onClose}>Скасувати</button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Збереження...' : apartment ? 'Зберегти зміни' : 'Додати квартиру'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [apartments, setApartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');

  const loadApartments = useCallback(async (term = search) => {
    setLoading(true);
    setError('');
    try {
      const result = await apartmentApi.getAll(term);
      setApartments(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadApartments(search), 250);
    return () => clearTimeout(timer);
  }, [search, loadApartments]);

  const stats = useMemo(() => ({
    count: apartments.length,
    rooms: apartments.reduce((sum, item) => sum + item.rooms, 0),
    area: apartments.reduce((sum, item) => sum + item.area, 0),
    value: apartments.reduce((sum, item) => sum + item.price, 0)
  }), [apartments]);

  const saveApartment = async (data) => {
    if (modal?.apartment) {
      await apartmentApi.update(modal.apartment.id, data);
      setNotice('Дані квартири оновлено');
    } else {
      await apartmentApi.create(data);
      setNotice('Нову квартиру додано');
    }
    await loadApartments();
  };

  const deleteApartment = async (apartment) => {
    const confirmed = window.confirm(`Видалити квартиру за адресою «${apartment.address}»?`);
    if (!confirmed) return;

    try {
      await apartmentApi.remove(apartment.id);
      setNotice('Квартиру видалено');
      await loadApartments();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark"><Building2 size={21} /></span>
          <span>estate<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="system-status"><span /> Система активна</span>
          <div className="avatar">EA</div>
        </div>
      </header>

      <div className="content">
        <section className="hero">
          <div>
            <div className="eyebrow">ПАНЕЛЬ КЕРУВАННЯ / НЕРУХОМІСТЬ</div>
            <h1>Квартири на продаж</h1>
            <p>Єдиний простір для керування об’єктами нерухомості та інформацією про власників.</p>
          </div>
          <button className="button button-primary add-button" onClick={() => setModal({ apartment: null })}>
            <Plus size={18} /> Додати квартиру
          </button>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon icon-violet"><Building2 size={19} /></div>
            <span className="stat-label">Усього об’єктів</span>
            <strong>{stats.count}</strong>
            <small>квартир у каталозі</small>
          </article>
          <article className="stat-card">
            <div className="stat-icon icon-blue"><BedDouble size={19} /></div>
            <span className="stat-label">Кімнат загалом</span>
            <strong>{stats.rooms}</strong>
            <small>у всіх об’єктах</small>
          </article>
          <article className="stat-card">
            <div className="stat-icon icon-green"><Ruler size={19} /></div>
            <span className="stat-label">Загальна площа</span>
            <strong>{stats.area.toLocaleString('uk-UA', { maximumFractionDigits: 1 })} <i>м²</i></strong>
            <small>сумарна площа квартир</small>
          </article>
          <article className="stat-card">
            <div className="stat-icon icon-orange"><Wallet size={19} /></div>
            <span className="stat-label">Вартість каталогу</span>
            <strong className="value-stat">{money(stats.value)}</strong>
            <small>сума всіх пропозицій</small>
          </article>
        </section>

        <section className="listing-panel">
          <div className="listing-head">
            <div>
              <h2>Каталог об’єктів</h2>
              <p>Усі квартири, доступні для продажу</p>
            </div>
            <div className="listing-tools">
              <label className="search-box">
                <Search size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пошук квартири..." />
                {search && <button onClick={() => setSearch('')} aria-label="Очистити пошук"><X size={15} /></button>}
              </label>
              <button className="icon-button refresh-button" onClick={() => loadApartments()} aria-label="Оновити">
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          {error && <div className="notice notice-error"><AlertCircle size={17} />{error}</div>}
          {notice && <div className="notice notice-success"><CheckCircle2 size={17} />{notice}</div>}

          {loading ? (
            <div className="empty-state"><div className="loader" /><span>Завантаження каталогу...</span></div>
          ) : apartments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Home size={27} /></div>
              <h3>{search ? 'Нічого не знайдено' : 'Каталог поки порожній'}</h3>
              <p>{search ? 'Спробуйте змінити пошуковий запит.' : 'Додайте першу квартиру, щоб почати роботу.'}</p>
              {!search && <button className="button button-primary" onClick={() => setModal({ apartment: null })}><Plus size={17} /> Додати квартиру</button>}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ОБ’ЄКТ</th>
                    <th>ХАРАКТЕРИСТИКИ</th>
                    <th>ВЛАСНИК</th>
                    <th>ЦІНА</th>
                    <th><span className="sr-only">Дії</span></th>
                  </tr>
                </thead>
                <tbody>
                  {apartments.map((apartment) => (
                    <tr key={apartment.id}>
                      <td>
                        <div className="property-cell">
                          <div className="property-icon"><Building2 size={20} /></div>
                          <div>
                            <strong>{apartment.address}</strong>
                            <span><MapPin size={13} />{apartment.district} район</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="features">
                          <span><BedDouble size={14} />{apartment.rooms} кімн.</span>
                          <span><Ruler size={14} />{apartment.area} м²</span>
                          <span><Layers3 size={14} />{apartment.floor} пов.</span>
                        </div>
                      </td>
                      <td>
                        <div className="owner-cell">
                          <strong><UserRound size={14} />{apartment.ownerName}</strong>
                          <span><Phone size={13} />{apartment.ownerPhone}</span>
                        </div>
                      </td>
                      <td><strong className="price">{money(apartment.price)}</strong></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => setModal({ apartment })} aria-label="Редагувати"><Pencil size={16} /></button>
                          <button className="icon-button delete-button" onClick={() => deleteApartment(apartment)} aria-label="Видалити"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="listing-footer">
            <span>Показано <strong>{apartments.length}</strong> об’єктів</span>
          </div>
        </section>

        <footer className="footer">
          <span>Керування нерухомістю <ArrowUpRight size={13} /></span>
        </footer>
      </div>

      {modal && <ApartmentModal apartment={modal.apartment} onClose={() => setModal(null)} onSave={saveApartment} />}
    </main>
  );
}

export default App;
