const negationSign = "~"
const empty = "empty"
const disjunction = "V"
const hasEmpty = (arr) => arr && arr.includes(empty)

const S = ["6V4", "5V4", "4V1", "~1V~2", "3V~6", "~4", "2V~5V~3"]
// const S = ["6", "~6"]
// const S = ["~1V~2V~3", "1", "2", "3"]


const P = ["1", "2", "3", "4", "5", "6"]

const getNegativeDisjuncts = (arrOfDisjuncts) =>
  arrOfDisjuncts.filter((disjunct) => !disjunct.includes(negationSign))

const getPositiveDisjuncts = (arrOfDisjuncts) =>
  arrOfDisjuncts.filter((disjunct) => disjunct.includes(negationSign))

let M = getNegativeDisjuncts(S)
const N = getPositiveDisjuncts(S)

const getLastLiteralInDisjunct = (disjunct) =>
  disjunct.slice(disjunct.lastIndexOf(disjunction) + 1, disjunct.length)

const areEqual = (a, b) => parseInt(a) === parseInt(b)

const isEmptyDisjunct = (disPos, disNeg) =>
  disPos.length === 1 && disNeg.length === 2

const disjunctionFn = (
  negativeDisjunct,
  positiveDisjunct,
  removableLiteral
) => {
  const removeLiteral = (disjunct, removableLiteral) =>
    disjunct
      .replace(`${disjunction}${removableLiteral}`, "")
      .replace(`${removableLiteral}${disjunction}`, "")
      .replace(`${removableLiteral}`, "")

  const newNegDisjunct = removeLiteral(
    negativeDisjunct,
    `${negationSign}${removableLiteral}`
  )
  const newPosDisjunct = removeLiteral(positiveDisjunct, removableLiteral)

  return newNegDisjunct && newPosDisjunct
    ? `${newPosDisjunct}${disjunction}${newNegDisjunct}`
    : newNegDisjunct
    ? newNegDisjunct
    : newPosDisjunct
}

const getResolvent = (positiveDisjunct, negativeDisjunct, maxPositiveLiteral) =>
  isEmptyDisjunct(positiveDisjunct, negativeDisjunct)
    ? empty
    : disjunctionFn(negativeDisjunct, positiveDisjunct, maxPositiveLiteral)

const calcResolventsFn1 = (positiveDisjuncts, negativeDisjuncts) => {
  let resolvents = []

  const _calcResolvents = (negativeDisjunct) => {
    const lastLiteral = getLastLiteralInDisjunct(negativeDisjunct)
    const lastLitWithoutNegSign = lastLiteral.replace(negationSign, "")

    const __calcResolvents = (positiveDisjunct) => {
      if (positiveDisjunct.includes(lastLitWithoutNegSign)) {
        const maxPositiveLiteral = getMaxLiteral(
          positiveDisjunct.split(disjunction)
        )

        if (areEqual(maxPositiveLiteral, lastLitWithoutNegSign)) {
          resolvents.push(
            getResolvent(positiveDisjunct, negativeDisjunct, maxPositiveLiteral)
          )
        }
      }
    }

    positiveDisjuncts.forEach(__calcResolvents)
  }
  negativeDisjuncts.forEach(_calcResolvents)
  return resolvents
}
const getMaxLiteral = (literalsArr) => {
  let max = 0
  literalsArr.forEach((literal) => {
    max = Math.max(P.indexOf(literal), max)
  })
  return P[max]
}

const getDisjunctLiteralsWithoutNegationSign = (negativeDisjunct) =>
  negativeDisjunct
    .split(disjunction)
    .filter((L) => L.includes(negationSign))
    .map((L) => L.replace(negationSign, ""))

const calcResolventsFn2 = (positiveDisjuncts, negativeDisjuncts) => {
  let resolvents = []
  const _calcResolvents = (positiveDisjunct) => {
    const maxPositiveLiteral = getMaxLiteral(
      positiveDisjunct.split(disjunction)
    )
    const __calcResolvents = (negativeDisjunct) => {
      const allNegativeLiterals =
        getDisjunctLiteralsWithoutNegationSign(negativeDisjunct)
      if (
        allNegativeLiterals.find((negLiteral) =>
          areEqual(maxPositiveLiteral, negLiteral)
        )
      ) {
        resolvents.push(
          getResolvent(positiveDisjunct, negativeDisjunct, maxPositiveLiteral)
        )
      }
    }
    negativeDisjuncts.forEach(__calcResolvents)
  }
  positiveDisjuncts.forEach(_calcResolvents)
  return resolvents
}
const connectA0Ai = (A) => {
  const connectedArr = []
  A.map(
    (arr) =>
      arr.length && connectedArr.push(...arr.filter((a) => !M.includes(a)))
  )
  return connectedArr
}

const SemanticResolution = () => {
  let A = [],
    B = [N],
    W = []
  const _semanticResolution = (i, j) => {
    if (hasEmpty(A[i])) {
      return
    } else {
      if (B[i] && B[i].length) {
        W[i + 1] = calcResolventsFn1(M, B[i])
        A[i + 1] = getNegativeDisjuncts(W[i + 1])
        B[i + 1] = getPositiveDisjuncts(W[i + 1])
        _semanticResolution(i + 1, j)
      } else {
        const T = connectA0Ai(A)
        M = M.concat(T)
        const R = calcResolventsFn2(T, N)
        A[0] = getNegativeDisjuncts(R)
        B[0] = getPositiveDisjuncts(R)
        _semanticResolution(0, j + 1)
      }
    }
    return `Done`
  }
  return _semanticResolution(0, 1)
}

const semResolutionResult = SemanticResolution()
console.log(semResolutionResult)
