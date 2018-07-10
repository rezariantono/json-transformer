function serializer(mapping) {

    this.mapping = mapping

    this.getIncludes = (req) => {

        var includes = (this.mapping.defaultIncludes || '').split(',')
        var requestIncludes = (req.query.includes || req.query.include || req.query.with || '').split(',')
        var requestExcludes = (req.query.excludes || req.query.exclude || req.query.without || '').split(',')

        requestIncludes.forEach((requestInclude) => {

            var splittedInclude = requestInclude.split('.')

            if (splittedInclude[1] != undefined) {

                var obj = {}
                function index(obj,i) {return obj[i]}
                splittedInclude.reduce(index, obj)
                includes.push(requestInclude)
                includes[requestInclude] = obj

            } else {

                includes.push(requestInclude)
            }
        })

        if (requestExcludes.length >= 1) {
            includes = includes.filter((include) => {
                return !requestExcludes.includes(include)
            })
        }

        console.log(includes)
        return includes

    }

    this.item = (item, includes) => {

        const data = this.mapping.transform(item)

        if (Array.isArray(includes)) {

            includes.forEach((include) => {

                const includeFunctionName = 'include' + include.replace(/^\w/, c => c.toUpperCase())

                console.log(includeFunctionName)
                if (typeof this.mapping[includeFunctionName] != 'function') {
                    throw new Error(includeFunctionName + ' is not defined in transformer')
                }

                // asdfasdf

                data[include] = this.mapping[includeFunctionName](item)
            })
        }

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