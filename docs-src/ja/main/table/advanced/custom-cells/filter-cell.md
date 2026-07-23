# Filter フィルター <Badge type="tip" text="^1.0.0" /> <Badge type="warning" text="Beta" />

Filter は組み込みの列ヘッダーフィルターコンポーネントです。列ヘッダーのフィルターアイコンをクリックするとフィルターパネルが表示されます。手動でオプションを指定する方法と、データから自動的にオプションを抽出する方法をサポートしています。

### 基本的な使い方

`createFilterCell` ファクトリ関数で Filter コンポーネントを作成し、`customHeaderCell` として使用します。

<demo react="advanced/custom-cells/FilterCell/index.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/FilterCell/index.tsx"></demo>

### オプションの自動抽出

`autoOptions: true` を設定すると、Filter は現在の列のデータから重複を除いた値を自動的に抽出し、フィルターオプションとして使用します。

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // データから自動的にオプションを抽出
    }),
}
```

::: tip 局限性
* `autoOptions` は少量のデータで開発するのに便利です。**大量のデータ**の場合、全量走査が必要でパフォーマンスの問題が発生する可能性があります。
* オプションの順序は固定ではありません。
:::

### フィルターロジックのカスタマイズ

`filter` パラメータを使用して、フィルターロジックをカスタマイズできます：

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: '30歳未満', value: 'young' },
            { label: '30歳以上', value: 'old' },
        ],
        filter: ({ row, cellValue, filterValues }) => {
            return filterValues.some(v => {
                if (v === 'young') return cellValue < 30;
                if (v === 'old') return cellValue >= 30;
                return false;
            });
        },
    }),
}
```

<demo react="advanced/custom-cells/FilterCell/CustomFilter.tsx" github="https://github.com/ja-plus/stk-table-react/tree/master/docs-demo/advanced/custom-cells/FilterCell/CustomFilter.tsx"></demo>

### createFilterCell オプション

`createFilterCell` ファクトリ関数は設定オブジェクトを受け取ります：

```ts
interface CreateFilterCellOption {
    /** リモートフィルタリングを使用するかどうか、デフォルト false */
    remote?: boolean;
    /** フィルター状態が変更されたときにトリガーされます */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| remote | `boolean` | `false` | リモートフィルタリングを使用するかどうか、true に設定すると自動データフィルタリングはトリガーされません |
| onChange | `(data) => void` | - | フィルター状態が変更されたときのコールバック、パラメータには `colKey`（列キー）と `status`（現在の列フィルター状態）が含まれます |

### 設定オプション

`FilterComponent` は設定オブジェクトを受け取ります：

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // フィルターオプションリスト
    filter?: (args) => boolean;     // カスタムフィルター関数
    autoOptions?: boolean;          // データから自動的にオプションを抽出するかどうか、デフォルト false
}

interface FilterOption {
    label: string;     // 表示テキスト
    value: any;        // フィルター値
    selected?: boolean; // デフォルトで選択されているかどうか
}
```

### FilterStatus 型

```ts
interface FilterStatus {
    /** 現在選択されているフィルター値の配列 */
    value: any[];
    /** カスタムフィルターロジック関数 */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```
