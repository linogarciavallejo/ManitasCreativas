// Type declarations for PivotTable.js
declare module 'pivottable' {
  export function pivotUI(
    data: Record<string, unknown>[],
    config: PivotUIConfig,
    overwrite?: boolean
  ): void;

  export interface PivotUIConfig {
    rows?: string[];
    cols?: string[];
    aggregatorName?: string;
    vals?: string[];
    rowOrder?: string;
    colOrder?: string;
    rendererName?: string;
    aggregators?: Record<string, () => Aggregator>;
    renderers?: Record<string, unknown>;
    hiddenAttributes?: string[];
    onRefresh?: (config: PivotUIConfig) => void;
    menuLimit?: number;
    unusedAttrsVertical?: boolean;
    sorters?: Record<string, (a: string, b: string) => number>;
  }

  export interface Aggregator {
    push: (record: Record<string, unknown>) => void;
    value: () => number;
    format: (x: number) => string;    [key: string]: unknown;
  }
}

// jQuery UI widget declarations
declare module 'jquery-ui/ui/widgets/sortable' {
  export default function(): void;
}

declare module 'jquery-ui/ui/widgets/draggable' {
  export default function(): void;
}

declare module 'jquery-ui/ui/widgets/droppable' {
  export default function(): void;
}

// Extend jQuery interface to include pivotUI
declare global {
  interface JQuery<TElement = HTMLElement> {
    pivotUI(
      data: Record<string, unknown>[],
      config: import('pivottable').PivotUIConfig,
      overwrite?: boolean
    ): JQuery<TElement>;
  }

  interface JQueryStatic {
    pivotUtilities: {
      renderers: Record<string, unknown>;
      aggregators: Record<string, unknown>;
    };
  }
}
