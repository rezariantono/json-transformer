function serializer(mapping) {

    this.mapping = mapping

    this.getIncludes = (req) => {

        var includes = (this.mapping.defaultIncludes || '').split(',')
        var requestIncludes = (req.query.includes || req.query.include || req.query.with || '').split(',')
        var requestExcludes = (req.query.excludes || req.query.exclude || req.query.without || '').split(',')

        if (this.mapping.availableIncludes) {

            var filteredAvailableIncludes = this.mapping.availableIncludes.split(',').filter((availableIncludeString) => {
                return requestIncludes.includes(availableIncludeString)
            })
            includes = includes.concat(filteredAvailableIncludes)
        }

        if (requestExcludes.length >= 1) {
            includes = includes.filter((include) => {
                return !requestExcludes.includes(include)
            })
        }

        return includes

    }

    this.item = (item, includes) => {
        
        console.log(this.mapping)
        console.log(item)
        const data = this.mapping.transform(item)

        (includes || []).forEach((include) => {

            const includeFunctionName = 'include' + include.replace(/^\w/, c => c.toUpperCase())

            if (typeof this.mapping[includeFunctionName] != 'function') {
                throw new Error(includeFunctionName + ' is not defined in transformer')
            }

            data[include] = this.mapping[includeFunctionName](item)
        })

        return data
    }

    this.transformItem = (item, meta, req) => {

        const includes = this.getIncludes(req)

        return {
            'data': this.item(item, includes),
            'meta': meta
        }
    }

    this.transformCollection = (collection, meta, req, pagination) => {

        const includes = this.getIncludes(req)

        const formattedCollection = []
        collection.forEach((item) => {
            console.log(this.item(item))
            formattedCollection.push(this.item(item, includes))
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