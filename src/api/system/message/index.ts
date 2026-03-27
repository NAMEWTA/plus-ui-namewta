import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MessageBoxVO } from './types';

export function getMessageBox(): AxiosPromise<MessageBoxVO> {
  return request({
    url: '/system/message/box',
    method: 'get'
  });
}
