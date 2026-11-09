const BASE_URL = '/api/apartments';

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const result = await response.json();

  if (!response.ok) {
    const message = result.errors?.map((item) => item.message).join('. ') || result.message || 'Сталася помилка';
    throw new Error(message);
  }

  return result;
}

export const apartmentApi = {
  getAll: (search = '') => request(`${BASE_URL}?search=${encodeURIComponent(search)}`),
  getById: (id) => request(`${BASE_URL}/${id}`),
  create: (data) => request(BASE_URL, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${BASE_URL}/${id}`, { method: 'DELETE' })
};
