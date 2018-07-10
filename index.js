function serializer(mapping) {

    this.mapping = mapping
    this.requestIncludes = []
    this.requestExcludes = []

    this.middleware = (req, res, next) => {
        
        this.requestIncludes.push((req.query.includes || req.query.include || req.query.with || '').split(','))
        this.requestExcludes.push((req.query.excludes || req.query.exclude || req.query.without || '').split(','))
        next()
    }

    this.setMapping = (mapping) => {
        this.mapping = mapping
    }

    this.getIncludes = () => {

        var includes = []

        if (this.mapping.defaultIncludes) {
            includes = includes.concat(this.mapping.defaultIncludes.split(','))
        }

        if (this.mapping.availableIncludes) {

            var filteredAvailableIncludes = this.mapping.availableIncludes.split(',').filter((availableIncludeString) => {
                return this.requestIncludes.includes(availableIncludeString)
            })
            includes = includes.concat(filteredAvailableIncludes)
        }

        console.log(includes)

        if (this.requestExcludes.length >= 1) {
            includes = includes.filter((include) => {
                return !this.requestExcludes.includes(include)
            })
        }

        console.log(includes)
        console.log(this.requestExcludes)

        return includes

    }

    this.item = (item) => {

        const data = this.mapping.transform(item)

        const includes = this.getIncludes()

        includes.forEach((include) => {

            const includeFunctionName = 'include' + include.replace(/^\w/, c => c.toUpperCase())

            if (typeof this.mapping[includeFunctionName] != 'function') {
                throw new Error(includeFunctionName + ' is not defined in transformer')
            }

            data[include] = this.mapping[includeFunctionName](item)
        })

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