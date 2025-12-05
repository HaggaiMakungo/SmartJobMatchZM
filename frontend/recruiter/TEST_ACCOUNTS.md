# 🔑 Test Company Accounts

List of available company accounts for testing the recruiter dashboard.

## 📋 Default Credentials

**All accounts use the same password:** `password123`

---

## 🏢 Companies with Most Jobs (Best for Testing)

### 1. **DHL** (Logistics)
- **Email:** `dhl@company.zm`
- **Jobs:** 12+ jobs (drivers, coordinators, managers)
- **Best for:** Testing logistics/transport matching

### 2. **Zanaco** (Banking)
- **Email:** `zanaco@company.zm`
- **Jobs:** 8+ jobs (accountants, analysts, tellers)
- **Best for:** Testing finance/banking matching

### 3. **Choppies** (Retail)
- **Email:** `choppies@company.zm`
- **Jobs:** 10+ jobs (store managers, cashiers, supervisors)
- **Best for:** Testing retail matching

### 4. **MTN Zambia** (Telecommunications)
- **Email:** `mtn@company.zm`
- **Jobs:** 6+ jobs (engineers, sales, support)
- **Best for:** Testing tech/telecom matching

### 5. **Shoprite** (Retail)
- **Email:** `shoprite@company.zm`
- **Jobs:** 8+ jobs
- **Best for:** Retail sector testing

---

## 🎯 Quick Test Scenarios

### Scenario 1: High-Volume Recruiting (DHL)
```
Email: dhl@company.zm
Password: password123
Test: Match candidates for 12 different logistics jobs
```

### Scenario 2: Banking Recruitment (Zanaco)
```
Email: zanaco@company.zm
Password: password123
Test: Match professionals for banking positions
```

### Scenario 3: Retail Chain (Choppies)
```
Email: choppies@company.zm
Password: password123
Test: Find store managers and supervisors
```

---

## 📝 Email Format

All test accounts follow this pattern:
```
<company_name_lowercase>@company.zm
```

Examples:
- `dhl@company.zm`
- `zanaco@company.zm`
- `shoprite@company.zm`
- `mtn@company.zm`

---

## 🔄 To Get Full List

Run this command in the backend folder to see all available companies:

```bash
cd backend
python list_company_accounts.py
```

Or use the interactive selector:

```bash
python select_company.py
```

---

## ⚠️ Important Notes

1. **Password is always:** `password123`
2. **Each company only sees their own jobs and saved candidates**
3. **Data is isolated per company**
4. **For production, change all default passwords!**

---

## 🚀 Quick Login

1. Go to: `http://localhost:3000/login`
2. Enter any email from above
3. Enter password: `password123`
4. Click "Sign In"

**Happy Testing!** 🎉
