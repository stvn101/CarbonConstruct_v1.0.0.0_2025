# Security Testing Guide - CarbonConstruct

This document outlines all security fixes implemented and how to test them.

## Overview of Security Fixes

### Phase 1: Authentication Fixes
- **parse-boq function**: Added JWT validation and Authorization header checking
- **chat function**: Added JWT validation and Authorization header checking

### Phase 2: Input Validation
- **parse-boq function**: 
  - Text must be string type
  - Length must be 10-15,000 characters
  - Validates BOQ format indicators
- **chat function**:
  - Messages must be an array
  - Max 50 messages per request
  - Each message must have valid role and content
  - Content max 10,000 chars per message

### Phase 3: Calculator Validation
- **Created validation schemas** (zod) for all calculator data types
- **Created validate-calculation function** for server-side validation
- **Updated Calculator component** with client-side and server-side validation

### Phase 4: Rate Limiting
- **Created rate_limits table** in database
- **Created rate limiting helper** function
- **Applied rate limits**:
  - parse-boq: 10 requests per 5 minutes
  - chat: 50 requests per 10 minutes
  - validate-calculation: 30 requests per 5 minutes

---

## Test Plan

### Test 1: Authentication - parse-boq Function

**Test 1.1: Unauthenticated Request (SHOULD FAIL)**
```bash
# This should return 401 Unauthorized
curl -X POST https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/parse-boq \
  -H "Content-Type: application/json" \
  -d '{"text": "Test BOQ document with 100m3 concrete"}'

# Expected: 401 Unauthorized with error message
```

**Test 1.2: Invalid Token (SHOULD FAIL)**
```bash
curl -X POST https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/parse-boq \
  -H "Authorization: Bearer invalid_token_12345" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test BOQ document with 100m3 concrete"}'

# Expected: 401 Unauthorized with error message
```

**Test 1.3: Valid Authenticated Request (SHOULD SUCCEED)**
- Log in to the application at /auth
- Upload a BOQ file via the calculator page
- Check browser console for successful response
- Expected: 200 OK with parsed materials

---

### Test 2: Authentication - chat Function

**Test 2.1: Unauthenticated Request (SHOULD FAIL)**
```bash
curl -X POST https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'

# Expected: 401 Unauthorized
```

**Test 2.2: Valid Authenticated Chat (SHOULD SUCCEED)**
- Log in to the application
- Navigate to a page with the chat assistant
- Send a message
- Expected: Chat response streams back successfully

---

### Test 3: Input Validation - parse-boq

**Test 3.1: Text Too Short (SHOULD FAIL)**
- Try to upload a file with less than 10 characters
- Expected: 400 Bad Request - "Text too short"

**Test 3.2: Text Too Long (SHOULD FAIL)**
- Try to upload a file with more than 15,000 characters
- Expected: 400 Bad Request - "Text exceeds maximum length"

**Test 3.3: Wrong Data Type (SHOULD FAIL)**
```javascript
// In browser console after authentication
const { data, error } = await supabase.functions.invoke('parse-boq', {
  body: { text: 12345 }  // Number instead of string
});
// Expected: 400 Bad Request - "Text must be a string"
```

**Test 3.4: Valid Input (SHOULD SUCCEED)**
- Upload a properly formatted BOQ document (10-15,000 chars)
- Expected: 200 OK with parsed materials

---

### Test 4: Input Validation - chat

**Test 4.1: Messages Not Array (SHOULD FAIL)**
```javascript
// In browser console after authentication
const { data, error } = await supabase.functions.invoke('chat', {
  body: { messages: "not an array" }
});
// Expected: 400 Bad Request - "Messages must be an array"
```

**Test 4.2: Too Many Messages (SHOULD FAIL)**
```javascript
// In browser console after authentication
const messages = Array(51).fill({ role: "user", content: "test" });
const { data, error } = await supabase.functions.invoke('chat', {
  body: { messages }
});
// Expected: 400 Bad Request - "Too many messages"
```

**Test 4.3: Invalid Message Structure (SHOULD FAIL)**
```javascript
// In browser console after authentication
const { data, error } = await supabase.functions.invoke('chat', {
  body: { messages: [{ role: "user" }] }  // Missing content
});
// Expected: 400 Bad Request - "Invalid message structure"
```

**Test 4.4: Message Content Too Long (SHOULD FAIL)**
```javascript
// In browser console after authentication
const longContent = "a".repeat(10001);
const { data, error } = await supabase.functions.invoke('chat', {
  body: { messages: [{ role: "user", content: longContent }] }
});
// Expected: 400 Bad Request - "Message content too long"
```

---

### Test 5: Calculator Validation

**Test 5.1: Negative Quantities (SHOULD FAIL)**
- In calculator, enter negative quantity for a material
- Try to save
- Expected: Client-side validation error: "Quantities cannot be negative"

**Test 5.2: Invalid Material Name (SHOULD FAIL)**
- Add custom material with name longer than 100 characters
- Try to save
- Expected: Client-side validation error: "Material name too long"

**Test 5.3: Emission Factor Too High (SHOULD FAIL)**
- Add custom material with factor > 100,000
- Try to save
- Expected: Validation error: "Emission factor too high"

**Test 5.4: Too Many Materials (SHOULD FAIL)**
- Try to add more than 500 materials
- Expected: Validation error: "Too many materials"

**Test 5.5: Valid Calculation (SHOULD SUCCEED)**
- Enter valid materials with positive quantities
- Enter valid fuel/electricity/transport inputs
- Save calculation
- Expected: Success message and redirect to reports

---

### Test 6: Rate Limiting - parse-boq

**Test 6.1: Exceed Rate Limit (SHOULD FAIL after 10 requests)**
- Log in to application
- Upload 11 BOQ files within 5 minutes
- Expected: First 10 succeed, 11th returns 429 with retry-after header

**Test 6.2: Wait for Reset (SHOULD SUCCEED)**
- After hitting rate limit, wait for the time specified in retry-after
- Try uploading again
- Expected: Request succeeds

---

### Test 7: Rate Limiting - chat

**Test 7.1: Exceed Rate Limit (SHOULD FAIL after 50 requests)**
- Send 51 chat messages within 10 minutes
- Expected: First 50 succeed, 51st returns 429

---

### Test 8: Rate Limiting - validate-calculation

**Test 8.1: Exceed Rate Limit (SHOULD FAIL after 30 requests)**
- Save 31 calculations within 5 minutes
- Expected: First 30 succeed, 31st returns 429

---

## Manual Testing Checklist

### Critical Security Tests (Must Pass)
- [ ] parse-boq rejects unauthenticated requests
- [ ] chat rejects unauthenticated requests
- [ ] parse-boq rejects text < 10 chars
- [ ] parse-boq rejects text > 15,000 chars
- [ ] chat rejects non-array messages
- [ ] chat rejects > 50 messages
- [ ] Calculator rejects negative quantities
- [ ] Rate limiting works on parse-boq (11th request fails)
- [ ] Rate limiting works on chat (51st request fails)
- [ ] Rate limiting resets after window expires

### Data Integrity Tests (Should Pass)
- [ ] Valid materials save correctly
- [ ] Valid fuel inputs save correctly
- [ ] Valid electricity inputs save correctly
- [ ] Custom materials validate correctly
- [ ] Emission factors validate correctly

---

## Testing Commands

### Quick Authentication Test
```javascript
// Run in browser console (logged out)
const { data, error } = await supabase.functions.invoke('parse-boq', {
  body: { text: "Test document with 100m3 concrete 20MPa" }
});
console.log('Should be 401:', error);
```

### Quick Rate Limit Test
```javascript
// Run in browser console (logged in)
async function testRateLimit() {
  for (let i = 1; i <= 12; i++) {
    const { data, error } = await supabase.functions.invoke('parse-boq', {
      body: { text: `Test document ${i} with 100m3 concrete 20MPa` }
    });
    console.log(`Request ${i}:`, error ? 'FAILED' : 'SUCCESS', error || data);
    await new Promise(r => setTimeout(r, 100)); // Small delay
  }
}
testRateLimit();
// Expected: First 10 succeed, then 429 errors
```

---

## Security Improvements Summary

| Issue | Phase | Status | Impact |
|-------|-------|--------|--------|
| Unauthenticated parse-boq access | 1 | ✅ Fixed | Critical - prevented AI credit abuse |
| Unauthenticated chat access | 1 | ✅ Fixed | Critical - prevented AI credit abuse |
| Unvalidated BOQ text input | 2 | ✅ Fixed | High - prevented injection/abuse |
| Unvalidated chat messages | 2 | ✅ Fixed | High - prevented injection/abuse |
| No calculator validation | 3 | ✅ Fixed | Medium - prevents data corruption |
| No rate limiting | 4 | ✅ Fixed | High - prevents service abuse |

All security fixes have been implemented and are ready for testing.
