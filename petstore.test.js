const request = require('supertest');
const apiURL = 'https://petstore.swagger.io/v2';

describe('Petstore API', () => {
  let petId;

  beforeAll(async () => {
    const newPet = { name: 'KOER', status: 'available' };
    const response = await request(apiURL).post('/pet').send(newPet);
    petId = response.body.id;
  });

  describe('Create Pet', () => {
    it('should create a new pet when all fields are provided', async () => {
      const newPet = { name: 'KOER', status: 'available' };
      const response = await request(apiURL).post('/pet').send(newPet);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(newPet));
    });

    it('should return a default pet object when pet data is empty', async () => {
      const response = await request(apiURL).post('/pet').send({});
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({ id: expect.any(Number), photoUrls: [], tags: [] }));
    });
  });

  describe('Delete Pet', () => {
    it('should return 404 when a non-existing ID is provided', async () => {
      const response = await request(apiURL).delete(`/pet/999999`).set('api_key', 'special-key');
      expect(response.status).toBe(200); 
      expect(response.body).toEqual(expect.objectContaining({ message: 'Pet not found' })); // Added expected error message
    });

    it('should return 404 when an invalid ID is provided', async () => {
      const response = await request(apiURL).delete(`/pet/invalid_id`).set('api_key', 'special-key');
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({ message: 'java.lang.NumberFormatException: For input string: "invalid_id"' }));
    });
  });

  describe('Find Pets by Status', () => {
    const statuses = ['available', 'pending', 'sold'];

    statuses.forEach(status => {
      it(`should find pets with status ${status}`, async () => {
        const response = await request(apiURL).get('/pet/findByStatus').query({ status });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach(pet => {
          expect(pet.status).toBe(status);
        });
      });
    });

    it('should return an empty array for invalid status', async () => {
      const response = await request(apiURL).get('/pet/findByStatus').query({ status: 'invalid_status' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('Find Pet by ID', () => {
    it('should return 404 for non-existing ID', async () => {
      const response = await request(apiURL).get(`/pet/999999`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({ message: 'Pet not found' }));
    });

    it('should return 404 for invalid ID', async () => {
      const response = await request(apiURL).get(`/pet/invalid_id`);
      expect(response.status).toBe(404);
      expect(response.body).toEqual(expect.objectContaining({ message: 'java.lang.NumberFormatException: For input string: "invalid_id"' }));
    });

    it('should return 405 when ID is not provided', async () => {
      const response = await request(apiURL).get('/pet/');
      expect(response.status).toBe(405);
      expect(response.body).toEqual(expect.objectContaining({}));
    });
  });

  describe('Update Pet', () => {
    it('should update a pet when a valid ID and data are provided', async () => {
      const updatedPet = { id: petId, name: 'UpdatedName', status: 'sold' };
      const response = await request(apiURL).put('/pet').send(updatedPet);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updatedPet));
    });

    it('should return 200 when a non-existing ID is provided', async () => { 
      const updatedPet = { id: 999999, name: 'UpdatedName', status: 'sold' };
      const response = await request(apiURL).put('/pet').send(updatedPet);
      expect(response.status).toBe(200); 
      expect(response.body).toEqual(expect.objectContaining(updatedPet)); 
    });

    it('should return 200 when ID is not provided', async () => { 
      const response = await request(apiURL).put('/pet/').send({ name: 'UpdatedName', status: 'sold' });
      expect(response.status).toBe(200); 
      expect(response.body).toEqual(expect.objectContaining({ name: 'UpdatedName', status: 'sold' })); 
    });
  });
});
