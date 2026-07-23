# Experimental Features

This is an experimental feature and may change in future versions.

## experimental.scrollY 

Transform-based vertical scrolling simulation.

Due to browser limitations on DOM element height, displaying extremely large datasets may cause issues. Using transform to simulate scrolling resolves this problem.

### Usage

```js
<StkTable
    virtual
    scrollRowByRow
    experimental={{ scrollY: true }} //[!code ++]
    dataSource={dataSource}
    columns={columns}
/>
```
