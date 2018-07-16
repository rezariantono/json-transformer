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

    this.getPagination = (pagination, collection) => {
        
        var paginationObject = {
            type: pagination.type || (isNaN(pagination.total) ? "cursor" : "paginator"),
            per_page: parseInt(pagination.count || pagination.per_page || pagination.paginate),
            count: collection.length,
            current_page: parseInt(pagination.page || pagination.current_page || 1),
        }

        if (paginationObject.type == 'paginator') {
            paginationObject.total = parseInt(pagination.total)
            paginationObject.total_pages = Math.ceil(paginationObject.total / paginationObject.per_page)
        }

        return paginationObject
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

        if (pagination) {
            Object.assign(meta, this.getPagination(pagination, collection))
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