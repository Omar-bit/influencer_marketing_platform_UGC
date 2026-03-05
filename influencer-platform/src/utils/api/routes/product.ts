const root = '/products';

export const CREATE_PRODUCT = root;
export const GET_PRODUCTS = root;
export const GET_PRODUCT = (id: string) => `${root}/${id}`;
export const GET_PRODUCT_BY_CODE = (code: string) => `${root}/code/${code}`;
export const UPDATE_PRODUCT = (id: string) => `${root}/${id}`;
export const DELETE_PRODUCT = (id: string) => `${root}/${id}`;
export const PURCHASE_PRODUCT = (code: string) => `${root}/purchase/${code}`;
export const GET_PRODUCT_SALES = `${root}/sales`;
export const GET_PRODUCT_FINANCIAL_STATS = `${root}/financial-stats`;
