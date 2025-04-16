// lib/firebaseAdmin.ts

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Only initialize the app once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      // These values come from your service account JSON
      projectId: "drivingschool-b441c",
      privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDYvvgsYYu9XVdb
tOxLd/Fvyca0PCAv3IgtOxwk1EYEcHgrOI9J+gAGuMyB2c6MekP4kFNctIGi7Nlu
9xP/bs55fugsfmOpH8IGCDDjhx6lDGIsZPqeSeKhBRjREYfshRhbxQE2ltjbBuHY
1fGeUSjRd0YX+LBfMkEACaB5STxwdF0+C6H0xoevkAcdJPTmC+xmoeJ1yKnN6OGn
XIZnI0rmlyH6a6S5euyIpMRxXpgZZtKjoA34pFuncmhmdgZ6Utd8bR6xzh8juVUi
7ATnBKcE6pMlgy2YJW8Epb5eNiMqXP1nU6TB2Q05ZIDRVKbgH8qZfsTxH0rALMS1
TozQI/T3AgMBAAECggEADokIBZnpECLxV9ITQqBhjZiffbjGg88rRrU/Fu0xYNzW
AjgBy/k7BThhZpfftSYB5upu3LmyM+XkUv+41JluuVEcatdzAYWCsnrcJHYMRQ9G
iimfcPwNebTozCR71A2863KTuUB2fIHCpZL7aB2TOjDgf30K/udU2pbKrzeNGRFl
ExBdlwpM1hQEBTP4O1U/0ncVX7XcHn2ysPZHWd0e50FBhBW6U+h+rv1/I6NAQnlA
lRbzH7CFiU6vwJB9RLrZMFcsHcy2sZTOXZZ0riXFb3Xb+NipotwdLhVj7LAi1FeA
ajfo8BtqhVR81GxizKb5NRdFEB0AD9RUPYZrb9hImQKBgQDtdjGn5R6NljupTiV1
fZKDNeAYL+VhxF5d3/Uxpda6xA6iNjji7x4Vq1Bc1ylT6N52jYMpOZ2JXxrnSMNF
cxvU8ceGM4iINNZcGBy6gp1tE6Lt8z8Xrt5fWS3tTGZoYxBqwj4/ZEQFWVrfyzuX
AEJxDuUEvgWcsuwWASiPicmeewKBgQDpqsKUzW9AJjYDdAPmMr3X4Nih+jXFQAN8
OfquKE/0eW4RXdeiEQcfPRQ1NcQJyGnkiqLZ/cfIrn7vTn77NIZoHXgTzlCC79kD
+EwZuE/zkL7peuwpRwNf7I5bsf1slPQbt/7JYFuA3v0Yq6BNCFw43Et03NTSDxgF
cYhQcAQ4tQKBgAMwQxpuCSr9iW+MjRQ2y3DXmFq6yem2KU45Y6F3CJsZZtjmwXzK
mSzRUBLvEK7/wXz2CXzUOTlO/Z19bKHSGd2SIYu7xWmOzBIQgNJATrzYNqfbTE2V
G4dMO0GkdPuR2PaWBR/0yLUJrh6zK+mrJzk9afXWV1zzShhBi7nhr8NhAoGBAJNa
C7qqki1x6z3iO1M/TFiGghYjIyVwaMI+DcclxMX2jWKGOyUId+VLLyMe9LD2oVBt
3KR7VTFIWOOwLINdbCTb8I0M3di0R7YpLlRJ1qFR9hJmYebl0Ur8cgmBBL8kb4vL
S/DRwuJRvGmCUWRCkWWKBkt7tvmAazWDkuKmwQLBAoGBANKoCAVbkkSHAoWiRvED
mzrM8f6KXLkcbNtV8Km7IjxE7Yk8dH/JRLEv3iXed3D+yBI/vqi/PSPG1lA4w8/c
TLLhVOQ0Oxgog2Ovl4yXDZW9dOpdMkFLazftOUh9lYDmqmlRsBJWSDL8JiZu7tvU
Qz3zxbwfuIrRBaLozETk4cko\n-----END PRIVATE KEY-----\n`, 
      clientEmail: "firebase-adminsdk-fbsvc@drivingschool-b441c.iam.gserviceaccount.com",
    }),
  });
}

export const db = getFirestore();
