function serializer(mapping) {

    this.mapping = mapping

    this.setMapping = (mapping) => {
        this.mapping = mapping
    }

    this.item = (item) => {

        const data = this.mapping.transform(item)

        if (this.mapping.defaultIncludes) {
            const includes = this.mapping.defaultIncludes.split(',')

            includes.forEach((include) => {
                data[include] = this.mapping['include' + include.replace(/^\w/, c => c.toUpperCase())](item)
            })
        }

        return data
    }


    this.transformItem = (item, meta) => {

        return {
            'data': this.item(item),
            'meta': meta
        }
    }

    this.transformCollection = (collection, meta, pagination) => {

        const formattedCollection = []
        collection.forEach((item) => {
            console.log(this.item(item))
            formattedCollection.push(this.item(item))
        })

        return {
            'data': formattedCollection,
            'meta': meta
        }
    }
}

module.exports = (mapping) => {
    return new serializer(mapping)
}