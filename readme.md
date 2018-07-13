
# JSON API response formatter

Create standardize JSON response output from your REST API by mapping object properties to json

## Internal Documentation

### Includes and excludes parsing


Data format:

```JSONasPerl
{
    "price": {
        "otherPrices" // Provide object name for further includes and excludes
    },
    "purchaseHistory": {} // Provide empty object if not further includes or excludes is expected 
}
```