'use strict'

module.exports = function (app, cb) {
  /*
   * These are just some general helpers for workflows - rows, columns, transforming object to find
   */
  //TODO Move these someplace else - server should just be for routing

  app.etlWorkflow = {}
  app.etlWorkflow.helpers = {}

  app.etlWorkflow.helpers.findOrCreateObj = function (data) {
    const andArray = []
    for (const k in data) {
      if (data.hasOwnProperty(k)) {
        let newObj = {}
        newObj[k] = data[k]
        andArray.push(newObj)
      }
    }

    return {
      and: andArray
    }
  }

  const listWells = function () {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const cols = ['01', '02', '03', '04', '05',
      '06', '07', '08', '09', '10', '11', '12'
    ]
    const allVals = []

    rows.map(function (row) {
      cols.map(function (col) {
        allVals.push(row + col)
      })
    })

    return allVals
  }

  app.etlWorkflow.helpers.all96Wells = listWells()

  app.etlWorkflow.helpers.list96Wells = function () {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const cols = ['01', '02', '03', '04', '05',
      '06', '07', '08', '09', '10', '11', '12'
    ]
    let allVals = []

    rows.map(function (row) {
      cols.map(function (col) {
        allVals.push(row + col)
      })
    })

    return allVals
  }
  app.etlWorkflow.helpers.list384Wells = function () {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    const cols = ['01', '02', '03', '04', '05',
      '06', '07', '08', '09', '10', '11', '12',
      '13', '14', '15', '16', '17', '18', '19',
      '20', '21', '22', '23', '24'
    ]
    let allVals = []

    rows.map(function (row) {
      cols.map(function (col) {
        allVals.push(row + col)
      })
    })

    return allVals
  }

  app.paginateModel = function(model, query, pageSize){
    return new Promise((resolve, reject) =>{
      app.models[model]
        .count(query)
        .then((count) => {
          let totalPages = Math.round(count / pageSize);
          resolve({count: count, totalPages: totalPages + 1});
        })
        .catch((error) => {
          console.log(error);
          reject(new Error(error));
        })
    });
  };

  // 384 well plates
  app.etlWorkflow.helpers.rows384 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
  app.etlWorkflow.helpers.cols384 = ['01', '02', '03', '04', '05',
    '06', '07', '08', '09', '10', '11', '12',
    '13', '14', '15', '16', '17', '18', '19',
    '20', '21', '22', '23', '24'
  ]

  // 96 Well Plates
  app.etlWorkflow.helpers.rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  app.etlWorkflow.helpers.cols = ['01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ]

  process.nextTick(cb) // Remove if you pass `cb` to an async function yourself
}
