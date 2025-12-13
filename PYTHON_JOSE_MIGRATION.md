# python-jose to PyJWT Migration Guide

## Background

This project previously included `python-jose==3.3.0` in requirements.txt for future authentication implementation. Due to **CVE-2024-33663** (critical algorithm confusion vulnerability with OpenSSH ECDSA keys), we migrated to PyJWT, which is actively maintained and secure.

## Vulnerability Details

- **CVE:** CVE-2024-33663
- **Affected:** python-jose through version 3.3.0
- **Type:** Algorithm confusion with OpenSSH ECDSA keys (similar to CVE-2022-29217)
- **Risk:** Attackers could forge JWT tokens by exploiting key format confusion
- **Severity:** Critical

## Migration

### Old Dependency (Vulnerable)
```python
python-jose[cryptography]==3.3.0
```

### New Dependency (Secure)
```python
pyjwt[crypto]==2.8.0
```

## Code Migration (If/When Needed)

If you implement Python backend authentication in the future, here's how to migrate code:

### python-jose (Old - DO NOT USE)
```python
from jose import jwt

# Encoding
token = jwt.encode(
    claims={'sub': '1234567890', 'name': 'John Doe'},
    key='secret',
    algorithm='HS256'
)

# Decoding
payload = jwt.decode(
    token,
    key='secret',
    algorithms=['HS256']
)
```

### PyJWT (New - USE THIS)
```python
import jwt

# Encoding
token = jwt.encode(
    payload={'sub': '1234567890', 'name': 'John Doe'},
    key='secret',
    algorithm='HS256'
)

# Decoding
payload = jwt.decode(
    jwt=token,
    key='secret',
    algorithms=['HS256']
)
```

### Key Differences

1. **Import statement:** `from jose import jwt` → `import jwt`
2. **Parameter names:** 
   - `claims` → `payload` (encoding)
   - First positional argument → `jwt=` parameter (decoding)
3. **Functionality:** Almost identical API, minimal changes needed

## Current Status

- ✅ **requirements.txt updated** with PyJWT 2.8.0
- ✅ **No code changes needed** (Python dependencies are for future use)
- ✅ **Current app uses Supabase** for authentication (unaffected by this vulnerability)
- ✅ **PyJWT verified** as having no known vulnerabilities

## Additional Resources

- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [CVE-2024-33663 Details](https://nvd.nist.gov/vuln/detail/CVE-2024-33663)
- [PyJWT GitHub](https://github.com/jpadilla/pyjwt)

## Questions?

If you have questions about this migration or need help implementing JWT authentication, refer to:
- PyJWT official documentation
- This project's security policy in SECURITY.md
- FastAPI JWT authentication guides (for backend implementation)

---

**Last Updated:** December 12, 2025  
**Status:** Migration Complete ✅
