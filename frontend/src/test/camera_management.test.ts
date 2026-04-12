import { renderHook, waitFor } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useCameras } from '../hooks/useCameras';
import { getCameras, analyzeCamera } from '../lib/api';

const server = setupServer(
  rest.get('/api/cameras', (req, res, ctx) => {
    return res(ctx.json([
      { id: 'CAM-01', video_url: '/videos/video_01.mov' },
      { id: 'CAM-02', video_url: '/videos/video_02.mov' },
    ]));
  }),
  rest.post('/api/cameras/:camId/analyze', (req, res, ctx) => {
    if (req.params.camId === 'CAM-01') {
      return res(ctx.json({
        analysis_id: 'analysis-1',
        timestamp: '2023-04-01T12:00:00Z',
        risk_factors: [],
        conclusion: 'No risk detected',
        recommended_actions: [],
        metadata: {
          people_detected: 0,
          overall_risk_score: 0,
          prediction: {
            likely_outcome: 'safe',
            confidence: 1,
          },
        },
      }));
    } else {
      return res(ctx.status(404), ctx.json({ detail: 'Camera not found' }));
    }
  })
);

describe('Camera Management', () => {
  it('fetches cameras successfully', async () => {
    const response = await getCameras();
    expect(response).toEqual([
      { id: 'CAM-01', video_url: '/videos/video_01.mov' },
      { id: 'CAM-02', video_url: '/videos/video_02.mov' },
    ]);
  });

  it('analyzes a camera successfully', async () => {
    const response = await analyzeCamera('CAM-01');
    expect(response).toHaveProperty('analysis_id', 'analysis-1');
  });

  it('handles analysis error', async () => {
    await expect(analyzeCamera('CAM-03')).rejects.toThrow('Camera not found');
  });

  it('useCameras hook fetches and analyzes cameras', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCameras());
    await waitForNextUpdate();
    expect(result.current.cameras).toHaveLength(2);
    expect(result.current.cameras[0]).toHaveProperty('status', 'done');
  });
});