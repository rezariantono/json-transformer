serializer = {
    mapping: null
}

serializer.useMapping = (mapping) => {
    serializer.mapping = mapping
}

serializer.item = (item) => {

    const data = serializer.mapping.transform(item)

    if (serializer.mapping.defaultIncludes) {
        const includes = serializer.mapping.defaultIncludes.split(',')

        includes.forEach((include) => {
            data[include] = serializer.mapping['include' + include.replace(/^\w/, c => c.toUpperCase())](item)
        })
    }

    return data
}

serializer.transformItem = (item, meta) => {

    return {
        'data': serializer.item(item),
        'meta': meta
    }
}

serializer.transformCollection = (collection, meta, pagination) => {

    const formattedCollection = []
    collection.forEach((item) => {
        console.log(serializer.item(item))
        formattedCollection.push(serializer.item(item))
    })

    return {
        'data': formattedCollection,
        'meta': meta
    }
}


module.exports = () => {
    return new serializer
}