import { getCameras, analyzeCamera } from '../frontend/src/lib/api';

describe('getCameras function', () => {
  it('should fetch cameras successfully', async () => {
    const cameras = await getCameras();
    expect(cameras).toBeInstanceOf(Array);
    cameras.forEach(camera => {
      expect(camera).toHaveProperty('id');
      expect(camera).toHaveProperty('video_url');
    });
  });

  it('should handle fetch error', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    await expect(getCameras()).rejects.toThrow('Network error');
  });

  it('should handle non-OK response', async () => {
    // Mock fetch to return a non-OK response
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      statusText: 'Not Found',
    }));
    await expect(getCameras()).rejects.toThrow('Failed to fetch camera list: Not Found');
  });
});

describe('analyzeCamera function', () => {
  it('should analyze camera successfully', async () => {
    // Mock fetch to return a successful response
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        analysis_id: '123',
        risk_factors: [],
        conclusion: 'Safe',
      }),
    }));
    const result = await analyzeCamera('CAM-01');
    expect(result).toHaveProperty('analysis_id', '123');
    expect(result).toHaveProperty('conclusion', 'Safe');
  });

  it('should handle analysis failure', async () => {
    // Mock fetch to return a non-OK response
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ detail: 'Analysis failed' }),
    }));
    await expect(analyzeCamera('CAM-01')).rejects.toThrow('Analysis failed');
  });
});