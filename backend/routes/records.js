const express =
require('express');

const router =
express.Router();

const controller =
require(
'../controllers/recordsController'
);




// GET ALL

router.get(
'/',
controller.getRecords
);

router.get(
'/work-options',
controller.getWorkOptions
);

router.get(
'/export',
controller.exportExcel
);



// BULK INSERT

router.post(
'/bulk',
controller.bulkInsert
);




// UPDATE

router.put(
'/:id',
controller.updateRecord
);



// DELETE

router.delete(
'/:id',
controller.deleteRecord
);



module.exports =
router;