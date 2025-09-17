# 🛠️ Inefficient Data Fetching Patterns in Hooks

_Hooks use inefficient data fetching patterns with unnecessary API calls and lack of caching_

---

## 🧩 Problem Statement

Several custom hooks (`useFilteredUsers`, `useUsersByLoginStatus`) use inefficient data fetching patterns that result in unnecessary API calls and lack proper caching mechanisms, leading to performance issues and increased server load.

- **Subsystem / Component:** Custom data fetching hooks
- **Environment:** All application environments
- **Error Logs / Stack Trace:** Increased API load and slower response times

---

## ⚠️ Root Cause Hypothesis

The hooks make API calls with `paging: false` which fetches all data at once, and don't implement proper caching or pagination strategies. This results in:
1. Large API responses that consume bandwidth
2. Unnecessary server load
3. Poor performance with large datasets
4. No caching to reduce repeated requests

---

## 📍 Scope & Location

- **Code Location:** 
  - `src/hooks/users.ts` (lines 15-100)
  - `src/hooks/dashboards.ts` (lines 10-40)
- **Configuration / Dependencies:** `@dhis2/app-runtime` for data fetching
- **Infrastructure:** Client-server architecture with DHIS2 API

---

## 🧪 Steps to Reproduce

1. Use the user engagement page with a large user group
2. Observe network tab in developer tools
3. Notice large API responses with all user data
4. Revisit the same page/user group
5. Notice repeated API calls without caching

---

## ✅ Expected Behavior

Application should use efficient data fetching with pagination, caching, and selective field retrieval to minimize bandwidth usage and server load.

---

## ❌ Actual Behavior

Application fetches all data at once without pagination or caching, leading to performance issues and unnecessary server load.

---

## 📊 Impact Assessment

- **Severity:** Medium
- **Affected Users:** All users working with large datasets
- **Business Risk:** Increased server costs, poor performance
- **Blast Radius:** All features using custom data fetching hooks

---

## 🛠️ Proposed Solution

1. Implement pagination in data fetching hooks
2. Add caching mechanisms using React Query features
3. Use selective field retrieval to minimize response size
4. Implement proper query invalidation and refetching strategies

Example fix for `useFilteredUsers`:
```typescript
// Instead of:
params: {
  paging: false,
  fields: "id,firstName,surname,username,name,displayName,phoneNumber,jobTitle,userCredentials[username,lastLogin,disabled,userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
},

// Use:
params: {
  page: variables.page || 1,
  pageSize: variables.pageSize || 50,
  fields: "id,name,displayName,userCredentials[username,lastLogin],userGroups[id,displayName]",
},
```

---

## 🎯 Rationale for Solution

These changes will significantly reduce bandwidth usage and server load while improving application performance. Pagination and caching are standard best practices for data-intensive applications.

---

## ✅ Acceptance Criteria

- [ ] Data fetching hooks implement pagination
- [ ] Proper caching mechanisms added
- [ ] API response sizes reduced by at least 50%
- [ ] Performance tests show improved loading times

---

## 👤 Assignee

_ [Derrick NUBY](https://github.com/derrick-nuby)

---

## 🏷️ Labels & Metadata

- **Type:** Performance
- **Priority:** P1
- **Status:** Open