import { useRef, useEffect, useState } from "react";

const subscriptions = new Set();

export function TEST_cleanup() {
  subscriptions.clear();
}

export function subscribe(subscription) {
  if (arguments.length > 1) {
    const actions = Array.isArray(arguments[0]) ? arguments[0] : [arguments[0]];
    const tempSubscription = subscription;
    subscription = params => {
      if (actions.includes(params.action)) {
        tempSubscription(params);
      }
    };
  }
  subscriptions.add(subscription);
  return () => {
    return subscriptions.delete(subscription);
  };
}

export function until(...actions) {
  return new Promise(resolve => {
    const unsubscribe = subscribe(params => {
      if (actions.includes(params.action)) {
        unsubscribe();
        resolve(params);
      }
    });
  });
}

export function dispatch(
  action,
  payload,
  cancellationToken = createCancellationToken()
) {
  let result = undefined;
  let notified = false;
  let error;

  if (typeof action === "function") {
    try {
      result = action(payload, createDispatchContext(cancellationToken));
    } catch (e) {
      error = e;
    }
  }

  if (result && typeof result.then === "function") {
    return Object.assign(
      new Promise((resolve, reject) => {
        result.then(
          result => {
            notified = true;
            notify({ action, payload, result });
            return result;
          },
          error => {
            if (error instanceof CancelError) return;
            reject(error);
          }
        );
      }),
      cancellationToken
    );
  } else {
    if (!notified) {
      notify({ action, payload, result });
    }
    if (error) {
      throw error;
    }
  }

  return result;
}

export function useSelector(selector) {
  const dataRef = useRef({});
  const [, rerender] = useState();
  const data = dataRef.current;
  data.selector = selector;
  data.rerender = rerender;
  data.props = selector();

  validateProps(data.props);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      if (data.isUnmount) {
        return;
      }
      const nextProps = data.selector();
      validateProps(nextProps);
      const hasChange = isPropsChanged(data.props, nextProps);
      if (hasChange) {
        data.rerender({});
      }
    });

    return function() {
      unsubscribe();
      data.isUnmount = true;
    };
  }, [data]);

  return data.props;
}

function createCancellationToken() {
  let isCancelled = false;
  return {
    cancelled() {
      return isCancelled;
    },
    cancel() {
      if (isCancelled) {
        return;
      }
      isCancelled = true;
    }
  };
}

function createDispatchContext(cancellationToken) {
  return {
    ...cancellationToken,
    dispatch(action, payload) {
      if (cancellationToken.cancelled()) {
        throw new CancelError();
      }
      return dispatch(action, payload, cancellationToken);
    },
    until(...actions) {
      if (cancellationToken.cancelled()) {
        throw new CancelError();
      }
      return until(...actions);
    }
  };
}

function validateProps(props) {
  if (typeof props === "undefined" || props === null) {
    throw new Error("Invalid selector result");
  }
}

function isPropsChanged(prevProps, nextProps) {
  if (prevProps === nextProps) {
    return false;
  }

  if (Array.isArray(prevProps) && Array.isArray(nextProps)) {
    if (prevProps.length !== nextProps.length) {
      return true;
    }
    return prevProps.some((value, index) => value !== nextProps[index]);
  }

  if (prevProps instanceof Date && nextProps instanceof Date) {
    return prevProps.getTime() !== nextProps.getTime();
  }

  if (typeof prevProps === "object" && typeof nextProps === "object") {
    return Object.keys(prevProps)
      .concat(Object.keys(nextProps))
      .some(key => prevProps[key] !== nextProps[key]);
  }

  return nextProps !== prevProps;
}

function notify(params) {
  for (const subscription of subscriptions) {
    subscription(params);
  }
}

class CancelError extends Error {}
