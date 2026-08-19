import type { UserTypeForm, UserTypeQuery, UserTypeVO } from '@/api/system/userType/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询登录域列表
 * @param query
 * @returns {*}
 */
export const listUserType = (query?: UserTypeQuery): AxiosPromise<PageResult<UserTypeVO>> => {
  return request({
    url: '/system/userType/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询登录域详细
 * @param userTypeId
 */
export const getUserType = (userTypeId: string | number): AxiosPromise<UserTypeVO> => {
  return request({
    url: '/system/userType/' + userTypeId,
    method: 'get'
  });
};

/**
 * 获取登录域选择框列表
 */
export const optionselect = (): AxiosPromise<UserTypeVO[]> => {
  return request({
    url: '/system/userType/options',
    method: 'get'
  });
};

/**
 * 新增登录域
 * @param data
 */
export const addUserType = (data: UserTypeForm) => {
  return request({
    url: '/system/userType',
    method: 'post',
    data: data
  });
};

/**
 * 修改登录域
 * @param data
 */
export const updateUserType = (data: UserTypeForm) => {
  return request({
    url: '/system/userType',
    method: 'put',
    data: data
  });
};

/**
 * 删除登录域
 * @param userTypeId
 */
export const delUserType = (userTypeId: string | number | Array<string | number>) => {
  return request({
    url: '/system/userType/' + userTypeId,
    method: 'delete'
  });
};
