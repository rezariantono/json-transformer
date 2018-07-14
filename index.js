function serializer(mapping) {

    this.mapping = mapping

    const parseInclude = (includeString) => {

        const reduce = (x, initialValue) => {
            return x.split('.').reduce((accumulator, val, index) => {
                if (index < 1 && val != '') {
                    var xArray = x.split('.')
                    xArray.shift()
                    if (xArray.length == 0) {
                        accumulator[val] = {}
                    } else {
                        accumulator[val] = reduce(xArray.join('.'))
                    }
                }


                return accumulator
            }, (initialValue == undefined ? {} : initialValue))
        }

        var object = includeString.split(',').reduce((accumulator, val, index) => {

            var contentArray = val.split('.')
            contentArray.shift()
            accumulator[val.split('.')[0]] = reduce(contentArray.join('.'), accumulator[val.split('.')[0]])
            return accumulator
        }, {})

        return object
    }

    this.getIncludes = (req) => {

        var includes = {}

        if (this.mapping.defaultIncludes) {

            Object.assign(includes, parseInclude(this.mapping.defaultIncludes))
        }

        var queryIncludes = (req.query.includes || req.query.include || req.query.with || false)
        if (queryIncludes) {
            Object.assign(includes, parseInclude(queryIncludes))
        }

        var queryExcludes = (req.query.excludes || req.query.exclude || req.query.without || '').split(',')

        queryExcludes.forEach((queryExclude) => {
            if (includes[queryExclude.split('.')[0]] != undefined) {
                delete includes[queryExclude.split('.')[0]]
            }
        })

        return includes
    }

    this.item = (item, includes) => {

        const data = this.mapping.transform(item)

        for (var includeKey in includes) {

            const includeFunctionName = 'include' + includeKey.replace(/^\w/, c => c.toUpperCase())
            if (typeof this.mapping[includeFunctionName] != 'function') {
                throw new Error(includeFunctionName + ' is not defined in transformer')
            }

            data[includeKey] = this.mapping[includeFunctionName](item, includes[includeKey])
        }

        return data
    }

    this.collection = (collection, includes) => {

        const formattedCollection = []
        collection.forEach((item) => {
            formattedCollection.push(this.item(item, includes))
        })

        return formattedCollection
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

        const paginate = (pagination) => {
            
            return {
                'pagination': {
                    'type' : pagination.type,
                    'total' : pagination.total ? pagination.total : null ,
                    'current_page': pagination.current,
                    'per_page': pagination.count
                }
            }
        }

        if(pagination){
           Object.assign(meta, paginate(pagination))
        }

        return {
            'data': this.collection(collection, includes),
            'meta': meta
        }
    }
}

module.exports = (mapping) => {
    return new serializer(mapping)
}