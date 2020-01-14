export interface IAsyncAction<T> {
  (payload?: any, context?: IActionContext<T>): Promise<T>;
}

export interface ISyncAction<T> {
  (payload?: any, context?: IActionContext<T>): T;
}

export type IAction<T> = ISyncAction<T> | IAsyncAction<T>;

export interface IAsyncTask<T> extends Promise<any> {
  /**
   * cancel async task
   */
  cancel();

  /**
   * get cancelled status of async task
   */
  cancelled(): boolean;
}

export interface IActionContext<T> extends IAsyncTask<T> {
  /**
   * Dispatches an synchronous action with payload
   * Notes: CancelError will be thrown to stop script execution if task is cancelled
   * @param action
   * @param payload
   */
  dispatch<T>(action: ISyncAction<T>, payload?: any): T;

  /**
   * Dispatches an asynchronous action with payload
   * Notes: CancelError will be thrown to stop script execution if task is cancelled
   * @param action
   * @param payload
   */
  dispatch<T>(action: IAsyncAction<T>, payload?: any): IAsyncTask<T>;

  /**
   * wait until one or many actions dispatched
   * Notes: CancelError will be thrown to stop script execution if task is cancelled
   * @param actions
   */
  until(...actions: IAction<any>[]): IListenerParams;
}

export interface IListenerParams {
  action: IAction<any>;
  payload: any;
  result: any;
}

export interface IListener {
  (params?: IListenerParams): any;
}

/**
 * Adds a specified action listener. It will be called any time an action is dispatched
 * @param action
 * @param listener
 */
export function subscribe(action: IAction<any>, listener: IListener);

/**
 * Adds a multiple actions listener. It will be called any time an action is dispatched
 * @param actions
 * @param listener
 */
export function subscribe(actions: IAction<any>[], listener: IListener);
/**
 * Adds a listener. It will be called any time an action is dispatched
 * @param listener
 */
export function subscribe(listener: IListener);

/**
 * Dispatches an asynchronous action with payload
 * @param action
 * @param payload
 */
export function dispatch<T>(
  action: IAsyncAction<T>,
  payload?: any
): IAsyncTask<T>;

/**
 * Dispatches an synchronous action with payload
 * @param action
 * @param payload
 */
export function dispatch<T>(action: ISyncAction<T>, payload?: any): T;

/**
 * wait until one or many actions dispatched
 * @param actions
 */
export function until(...actions: IAction<any>[]): IListenerParams;

/**
 * 1. useSelector() will run your selector whenever an action is dispatched
 * 2. When an action is dispatched, useSelector() will do a reference comparison of the previous selector result value and the current result value.
 * 3. If they are different, the component will be forced to re-render. If they are the same, the component will not re-render.
 * 4. useSelector() uses strict === reference equality checks by default, not shallow equality
 * @param selector
 */
export function useSelector<T>(selector: () => T): T;

/**
 * Clean up all listeners, this used for testing environment
 * Call this method inside beforeEach/afterEach test lifecycle
 */
export function TEST_cleanup();
