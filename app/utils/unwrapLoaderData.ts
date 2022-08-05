// @ts-ignore
export type LoaderData<T> = Awaited<ReturnType<Awaited<ReturnType<T>>['json']>>