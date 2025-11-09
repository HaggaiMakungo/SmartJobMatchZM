#!/bin/bash
# Quick migration script for JobMatch mobile app
# Run this from the frontend/jobmatch directory

echo "🚀 JobMatch Mobile - Quick Migration Script"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend/jobmatch directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Backup old files
echo "📦 Step 1: Backing up old service files..."
mkdir -p .backup
cp src/services/jobs.service.ts .backup/jobs.service.ts.old 2>/dev/null || echo "  ℹ️  No old jobs.service.ts found"
cp src/services/match.service.ts .backup/match.service.ts.old 2>/dev/null || echo "  ℹ️  No old match.service.ts found"
cp src/hooks/useJobs.ts .backup/useJobs.ts.old 2>/dev/null || echo "  ℹ️  No old useJobs.ts found"
echo "  ✅ Backups saved to .backup/ folder"
echo ""

# Step 2: Replace with new files
echo "🔄 Step 2: Installing new service files..."

if [ -f "src/services/jobs.service.new.ts" ]; then
    cp src/services/jobs.service.new.ts src/services/jobs.service.ts
    echo "  ✅ jobs.service.ts updated"
else
    echo "  ⚠️  Warning: jobs.service.new.ts not found"
fi

if [ -f "src/services/matching.service.new.ts" ]; then
    cp src/services/matching.service.new.ts src/services/match.service.ts
    echo "  ✅ match.service.ts updated"
else
    echo "  ⚠️  Warning: matching.service.new.ts not found"
fi

if [ -f "src/hooks/useJobs.new.ts" ]; then
    cp src/hooks/useJobs.new.ts src/hooks/useJobs.ts
    echo "  ✅ useJobs.ts updated"
else
    echo "  ⚠️  Warning: useJobs.new.ts not found"
fi

echo ""

# Step 3: Verify types file exists
echo "📝 Step 3: Verifying job types file..."
if [ -f "src/types/jobs.ts" ]; then
    echo "  ✅ jobs.ts types file exists"
else
    echo "  ⚠️  Warning: src/types/jobs.ts not found - you may need to create it"
fi
echo ""

# Step 4: Check if backend is running
echo "🔌 Step 4: Checking backend connection..."
if command -v curl &> /dev/null; then
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs | grep -q "200"; then
        echo "  ✅ Backend is running at http://localhost:8000"
    else
        echo "  ⚠️  Backend doesn't seem to be running"
        echo "     Start it with: cd backend && python -m uvicorn app.main:app --reload"
    fi
else
    echo "  ℹ️  curl not available - skipping backend check"
fi
echo ""

# Summary
echo "✨ Migration Complete!"
echo "===================="
echo ""
echo "📋 Next Steps:"
echo "  1. Update your screen components to use new hooks"
echo "  2. Start the dev server: npx expo start"
echo "  3. Test with Brian Mwale login"
echo "  4. Check home screen, jobs screen, and job details"
echo ""
echo "📚 Documentation:"
echo "  • Full guide: MOBILE_APP_UPDATED.md"
echo "  • Types reference: src/types/jobs.ts"
echo "  • API docs: http://localhost:8000/docs"
echo ""
echo "🔄 To rollback:"
echo "  cp .backup/*.old src/services/ or src/hooks/"
echo ""
echo "Made in Zambia 🇿🇲"
