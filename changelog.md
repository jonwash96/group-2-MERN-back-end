# Change Log

## JW — Feb 25/Mar 11
### Front-End Changes
  - **Case-insensitive usernames**
      - Usernames still hold their casing in the db.
      - Sign-up & Sign-in are case insensitive.
      - "georgewashington" is the same as "GeorgeWashington". Thus, only one user can have a username with these characters in this order, regardless of their casing.
  - **Fixed Sign out process**
      - This was previously not removing the users auth token from the browser. This has now been fixed.
  - **File System**
      - Moved Dashboard **From** Components **To** Pages
      - Restructured Expense & Budget pages & associated views into their own sub-driectories
  - **Activated & Styled Notifications Panel**
### Back-End Changes
  - **Added Readme**
### General Changes
  - **Edited Readme**
      - Minor spelling & grammatical corrections
