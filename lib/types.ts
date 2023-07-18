/**
 * From T, retrieves all union type of all the values of the object T.
 */
export type ValueOf<T> = T[keyof T];

/**
 * From T, pick a set of properties to make it required.
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
