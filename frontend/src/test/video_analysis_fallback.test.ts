import { test, expect } from '@jest/globals';
import axios from 'axios';

test('should fallback to YOLO when primary analysis fails', async () => {
  jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Primary analysis failed'));
  const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
  const response = await axios.post('/analyze', videoFile, {
    headers: { 'Content-Type': 'video/mp4' },
  });
  expect(response.data.analysis_source).toBe('fallback_yolo');
  expect(response.status).toBe(200);
});

test('should return correct analysis response when YOLO fallback is used', async () => {
  jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Primary analysis failed'));
  const yoloResponse = {
    clip_summary: {
      overall_assessment: 'Fallback analysis using YOLOv8',
      people_detected: 1,
    },
    per_person: [],
    timeline: [],
    prediction_next_5_10s: {},
    recommended_action: { action: 'monitor', why: ['Primary analysis failed, using YOLO fallback'] },
  };
  jest.spyOn(axios, 'post').mockResolvedValueOnce({ data: yoloResponse });
  const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
  const response = await axios.post('/analyze', videoFile, {
    headers: { 'Content-Type': 'video/mp4' },
  });
  expect(response.data).toHaveProperty('risk_factors');
  expect(response.data).toHaveProperty('conclusion');
  expect(response.data).toHaveProperty('recommended_actions');
  expect(response.data.metadata.analysis_source).toBe('fallback_yolo');
});

test('should handle YOLO fallback failure correctly', async () => {
  jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Primary analysis failed'));
  jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('YOLO fallback failed'));
  const videoFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
  const response = await axios.post('/analyze', videoFile, {
    headers: { 'Content-Type': 'video/mp4' },
  });
  expect(response.status).toBe(500);
});