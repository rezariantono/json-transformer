const serializer = {
    mapping: null
}

serializer.useMapping = (mapping) => {
    this.mapping = mapping
    return serializer
}

serializer.transformCollection = (collection, meta, pagination) => {

    const formattedCollection = []
    collection.forEach((item) => {
        formattedCollection.push(this.mapping.transform(item))
    })

    return {
        'data': formattedCollection,
        'meta': meta
    }
}

serializer.transformItem = (item, meta) => {

    const data = this.mapping.transform(item)

    if (this.mapping.defaultIncludes) {
        const includes = this.mapping.defaultIncludes.split(',')

        includes.forEach((include) => {
            
            data[include] = this.mapping['include' + include.replace(/^\w/, c => c.toUpperCase()) ](item)
        })
    }

    return {
        'data': data,
        'meta': meta
    }
}

module.exports = serializer
