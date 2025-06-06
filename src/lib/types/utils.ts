export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function hasProp<K extends PropertyKey>(data: object, prop: K): data is Record<K, unknown> {
  return prop in data;
}

export function hasKey<O extends object>(obj: O, key: PropertyKey): key is keyof O {
  return key in obj;
}

export type WithDatesAsStrings<T extends object> = { [K in keyof T]: T[K] extends Date ? string : K };

export const getExactTypeFor =
  <T>() =>
  <TOut extends T>(inputOutput: TOut) =>
    inputOutput;
