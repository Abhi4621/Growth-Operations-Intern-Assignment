import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { candidatesController } from '../controllers/candidatesController.js';
import { leadsController } from '../controllers/leadsController.js';
import { researchController } from '../controllers/researchController.js';
import { aiController } from '../controllers/aiController.js';
import { evaluationsController } from '../controllers/evaluationsController.js';
import { auditController } from '../controllers/auditController.js';
import { growthPlansController } from '../controllers/growthPlansController.js';
import { founderUpdatesController } from '../controllers/founderUpdatesController.js';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/index.js';

const router = Router();

// 1. Health check & configuration status (safely reports if AI key is active without leaking secrets)
router.get('/health', (req, res) => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_api_key'));
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini'));
  const activeProvider = hasOpenAI ? 'OpenAI' : hasGemini ? 'Google Gemini' : 'Deterministic Operations Engine';
  const activeModel = hasOpenAI
    ? (process.env.OPENAI_MODEL || config.openai.model)
    : hasGemini
    ? (process.env.GEMINI_MODEL || config.gemini.model)
    : null;

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiConfig: {
      openaiConfigured: hasOpenAI,
      geminiConfigured: hasGemini,
      activeProvider,
      model: activeModel,
      fallbackConfigured: hasGemini,
      statusMessage: hasOpenAI
        ? `OpenAI API is configured and operational (${activeModel}).`
        : hasGemini
        ? `Google Gemini API is active and operational (${activeModel}).`
        : 'Running in deterministic evaluation mode. Add OPENAI_API_KEY in .env to activate live OpenAI reasoning.',
    },
  });
});

// 2. Authentication
router.post('/auth/login', rateLimiter(20), authController.login);
router.get('/auth/me', authenticate, authController.me);

// 3. Candidates
router.get('/candidates/stats', candidatesController.getStats);
router.get('/candidates', candidatesController.list);
router.get('/candidates/:id', candidatesController.get);
router.post('/candidates', optionalAuthenticate, candidatesController.create);
router.patch('/candidates/:id/status', authenticate, requireAdmin, candidatesController.updateStatus);
router.post('/candidates/:id/submissions', optionalAuthenticate, candidatesController.saveSubmission);

// 4. Operations Tracker Leads
router.get('/leads', leadsController.list);
router.get('/leads/:id', leadsController.get);
router.post('/leads', optionalAuthenticate, leadsController.create);
router.patch('/leads/:id', optionalAuthenticate, leadsController.update);
router.delete('/leads/:id', optionalAuthenticate, leadsController.delete);

// 5. Business Research Records
router.get('/research', researchController.list);
router.get('/research/:id', researchController.get);
router.post('/research', optionalAuthenticate, researchController.create);
router.patch('/research/:id', optionalAuthenticate, researchController.update);
router.delete('/research/:id', optionalAuthenticate, researchController.delete);

// 6. Growth Plans (Persistence & Execution)
router.get('/growth-plans', growthPlansController.list);
router.get('/growth-plans/:id', growthPlansController.get);
router.post('/growth-plans', optionalAuthenticate, growthPlansController.save);
router.patch('/growth-plans/:id/tasks/:taskId', optionalAuthenticate, growthPlansController.updateTaskStatus);

// 7. Founder Updates (Persistence & Editing)
router.get('/founder-updates', founderUpdatesController.list);
router.get('/founder-updates/:id', founderUpdatesController.get);
router.post('/founder-updates', optionalAuthenticate, founderUpdatesController.save);

// 6. AI Endpoints (Protected by Rate Limiter & Sanitization)
router.post('/analyse-business', rateLimiter(60), aiController.analyseBusiness);
router.post('/generate-outreach', rateLimiter(60), aiController.generateOutreach);
router.post('/generate-growth-plan', rateLimiter(60), aiController.generateGrowthPlan);
router.post('/generate-founder-update', rateLimiter(60), aiController.generateFounderUpdate);
router.post('/evaluate-candidate', rateLimiter(60), optionalAuthenticate, aiController.evaluateCandidate);

// 7. Evaluations & Scores
router.get('/evaluations', evaluationsController.list);
router.get('/evaluations/:candidateId', evaluationsController.getByCandidate);
router.post('/evaluations/override', authenticate, requireAdmin, evaluationsController.override);

// 8. Audit Logs
router.get('/audit-logs', authenticate, requireAdmin, auditController.list);

export default router;
