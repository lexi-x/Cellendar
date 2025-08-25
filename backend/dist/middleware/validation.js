"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTask = exports.validateCulture = exports.validateAuth = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const response = {
            success: false,
            error: 'Validation failed',
            data: errors.array()
        };
        return res.status(400).json(response);
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateAuth = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    exports.handleValidationErrors
];
exports.validateCulture = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('cell_type').trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('start_date').isISO8601(),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 1000 }),
    exports.handleValidationErrors
];
exports.validateTask = [
    (0, express_validator_1.body)('culture_id').isUUID(),
    (0, express_validator_1.body)('type').isIn(['media_change', 'passaging', 'observation']),
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 1000 }),
    (0, express_validator_1.body)('scheduled_date').isISO8601(),
    (0, express_validator_1.body)('reminder_hours').optional().isInt({ min: 0, max: 168 }),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map