const dataMethods = ["body", "params", "query", "headers", "file","files"] ;


export const validation = (schema) => {
	return (req, res, next) => {
		const validationErrors = []
		dataMethods.forEach((key) => {
			if (schema[key]) {
				const validationRes = schema[key].validate(req[key], { abortEarly: false})
				if (validationRes.error) {
					validationErrors.push(validationRes)
				}
			}
		})
		if(validationErrors.length){
			return res.json({ message: "Error", validationErrors })
		}
		return next()
	}
}

