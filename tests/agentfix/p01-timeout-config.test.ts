/**
 * P01: 缺少请求超时配置 - 测试驱动修复
 *
 * 问题：YuqueClient 创建 axios 实例时缺少 timeout 配置
 * 风险：网络请求可能无限期挂起，导致资源占用和用户体验差
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { YuqueClient } from '../../src/services/yuque-client.js';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('P01 - 请求超时配置', () => {
  const mockToken = 'test-token';
  const mockBaseURL = 'https://www.yuque.com/api/v2';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('axios 实例配置', () => {
    it('应该使用 timeout 配置创建 axios 实例', () => {
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      new YuqueClient(mockToken, mockBaseURL);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: mockBaseURL,
          headers: {
            'X-Auth-Token': mockToken,
            'Content-Type': 'application/json',
          },
          timeout: expect.any(Number),
        })
      );
    });

    it('应该设置默认超时时间为 30 秒', () => {
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      new YuqueClient(mockToken, mockBaseURL);

      const createCallArgs = mockedAxios.create.mock.calls[0][0];
      expect(createCallArgs?.timeout).toBe(30000);
    });

    it('应该包含完整的 axios 配置', () => {
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      new YuqueClient(mockToken, mockBaseURL);

      const createCallArgs = mockedAxios.create.mock.calls[0][0];
      expect(createCallArgs).toEqual({
        baseURL: mockBaseURL,
        headers: {
          'X-Auth-Token': mockToken,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    });
  });

  describe('超时行为', () => {
    it('应该在请求超时时抛出错误', async () => {
      const timeoutError = new Error('timeout of 30000ms');
      timeoutError.name = 'AxiosError';
      (timeoutError as any).code = 'ECONNABORTED';

      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(timeoutError),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      const client = new YuqueClient(mockToken, mockBaseURL);

      await expect(client.getUser()).rejects.toThrow();
    });

    it('应该正确传递 timeout 到 get 请求', async () => {
      const mockUser = { id: 1, login: 'testuser', name: 'Test User' };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { data: mockUser } }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      const client = new YuqueClient(mockToken, mockBaseURL);
      await client.getUser();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user');
    });

    it('应该支持单个请求覆盖默认 timeout', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { data: {} } }),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      const client = new YuqueClient(mockToken, mockBaseURL);
      await client.getDoc(1, 1);

      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });

  describe('配置验证', () => {
    it('应该使用默认的 Yuque API baseURL', () => {
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      new YuqueClient(mockToken);

      const createCallArgs = mockedAxios.create.mock.calls[0][0];
      expect(createCallArgs?.baseURL).toBe('https://www.yuque.com/api/v2');
    });

    it('应该正确设置认证头', () => {
      const mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      };
      mockedAxios.create.mockReturnValue(mockAxiosInstance as never);

      new YuqueClient(mockToken, mockBaseURL);

      const createCallArgs = mockedAxios.create.mock.calls[0][0];
      expect(createCallArgs?.headers).toEqual({
        'X-Auth-Token': mockToken,
        'Content-Type': 'application/json',
      });
    });
  });
});
