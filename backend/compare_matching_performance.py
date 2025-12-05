"""
Side-by-side comparison: OLD vs OPTIMIZED matching
Perfect for thesis presentation demo
"""
import requests
import time
from colorama import init, Fore, Style

init()  # Initialize colorama for colored output

API_BASE = "http://localhost:8000/api"

def colored_time(seconds):
    """Color code based on speed"""
    if seconds < 1:
        return f"{Fore.GREEN}{seconds:.2f}s{Style.RESET_ALL}"
    elif seconds < 3:
        return f"{Fore.YELLOW}{seconds:.2f}s{Style.RESET_ALL}"
    else:
        return f"{Fore.RED}{seconds:.2f}s{Style.RESET_ALL}"

def test_endpoint(endpoint_name, url, headers, params):
    """Test a single endpoint and return results"""
    print(f"  Testing {endpoint_name}...", end=" ")
    
    start = time.time()
    response = requests.get(url, headers=headers, params=params)
    elapsed = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        candidates = data.get('total_candidates', 0)
        from_cache = data.get('from_cache', False)
        
        cache_indicator = " ⚡(cached)" if from_cache else ""
        print(f"{colored_time(elapsed)} - {candidates} candidates{cache_indicator}")
        return elapsed, candidates, from_cache
    else:
        print(f"{Fore.RED}FAILED{Style.RESET_ALL}")
        return None, None, None

def compare_endpoints(job_id: str, company_email: str, password: str = "password123"):
    """
    Compare OLD vs NEW (OPTIMIZED) endpoints
    Perfect for live demo during presentation
    """
    
    # Login
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}🎓 THESIS PRESENTATION: MATCHING OPTIMIZATION DEMO{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*70}{Style.RESET_ALL}\n")
    
    print(f"🔐 Logging in as {company_email}...")
    login_response = requests.post(f"{API_BASE}/auth/login", json={
        "email": company_email,
        "password": password
    })
    
    if login_response.status_code != 200:
        print(f"{Fore.RED}❌ Login failed{Style.RESET_ALL}")
        return
    
    token = login_response.json()['access_token']
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"{Fore.GREEN}✅ Logged in successfully{Style.RESET_ALL}\n")
    
    # Test parameters
    params = {"limit": 20, "min_score": 0.0}
    
    # OLD ENDPOINT
    print(f"{Fore.YELLOW}{'─'*70}{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}📊 BEFORE: Original Matching Endpoint{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}{'─'*70}{Style.RESET_ALL}")
    
    old_url = f"{API_BASE}/recruiter/job/{job_id}/candidates"
    
    # First request
    print(f"\n1️⃣  First Request:")
    old_time1, old_candidates1, _ = test_endpoint(
        "Original endpoint",
        old_url,
        headers,
        params
    )
    
    # Second request (no caching in old version)
    time.sleep(0.5)
    print(f"\n2️⃣  Second Request:")
    old_time2, old_candidates2, _ = test_endpoint(
        "Original endpoint",
        old_url,
        headers,
        params
    )
    
    # NEW OPTIMIZED ENDPOINT
    print(f"\n{Fore.GREEN}{'─'*70}{Style.RESET_ALL}")
    print(f"{Fore.GREEN}🚀 AFTER: Optimized Matching Endpoint (Option A){Style.RESET_ALL}")
    print(f"{Fore.GREEN}{'─'*70}{Style.RESET_ALL}")
    
    new_url = f"{API_BASE}/recruiter/optimized/job/{job_id}/candidates"
    params_with_cache = {**params, "use_cache": True}
    
    # First request
    print(f"\n1️⃣  First Request:")
    new_time1, new_candidates1, new_cache1 = test_endpoint(
        "Optimized endpoint",
        new_url,
        headers,
        params_with_cache
    )
    
    # Second request (should be cached)
    time.sleep(0.5)
    print(f"\n2️⃣  Second Request:")
    new_time2, new_candidates2, new_cache2 = test_endpoint(
        "Optimized endpoint",
        new_url,
        headers,
        params_with_cache
    )
    
    # RESULTS COMPARISON
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}📈 OPTIMIZATION RESULTS{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*70}{Style.RESET_ALL}\n")
    
    if old_time1 and new_time1:
        improvement1 = ((old_time1 - new_time1) / old_time1) * 100
        speedup1 = old_time1 / new_time1 if new_time1 > 0 else 0
        
        print(f"⏱️  First Request:")
        print(f"   Before:  {colored_time(old_time1)}")
        print(f"   After:   {colored_time(new_time1)}")
        print(f"   {Fore.GREEN}Speedup: {speedup1:.1f}x faster ({improvement1:.0f}% faster){Style.RESET_ALL}")
    
    if old_time2 and new_time2:
        improvement2 = ((old_time2 - new_time2) / old_time2) * 100
        speedup2 = old_time2 / new_time2 if new_time2 > 0 else 0
        
        print(f"\n⚡ Second Request (Cached):")
        print(f"   Before:  {colored_time(old_time2)} (no caching)")
        print(f"   After:   {colored_time(new_time2)} ⚡(instant cache)")
        print(f"   {Fore.GREEN}Speedup: {speedup2:.1f}x faster ({improvement2:.0f}% faster){Style.RESET_ALL}")
    
    # VISUAL COMPARISON
    print(f"\n{Fore.MAGENTA}{'─'*70}{Style.RESET_ALL}")
    print(f"{Fore.MAGENTA}📊 VISUAL COMPARISON{Style.RESET_ALL}")
    print(f"{Fore.MAGENTA}{'─'*70}{Style.RESET_ALL}\n")
    
    def draw_bar(seconds, max_seconds=10):
        """Draw a visual bar for time"""
        bar_length = int((seconds / max_seconds) * 50)
        return "█" * bar_length
    
    if old_time1 and new_time1:
        print(f"First Request:")
        print(f"  Before:  {draw_bar(old_time1)} {old_time1:.2f}s")
        print(f"  After:   {draw_bar(new_time1)} {new_time1:.2f}s")
    
    if old_time2 and new_time2:
        print(f"\nSecond Request:")
        print(f"  Before:  {draw_bar(old_time2)} {old_time2:.2f}s")
        print(f"  After:   {draw_bar(new_time2)} {new_time2:.2f}s (cached)")
    
    # KEY ACHIEVEMENTS
    print(f"\n{Fore.GREEN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.GREEN}✅ KEY ACHIEVEMENTS{Style.RESET_ALL}")
    print(f"{Fore.GREEN}{'='*70}{Style.RESET_ALL}\n")
    
    print("✅ In-memory caching (5-minute TTL)")
    print("✅ Smart CV filtering (500 → 100 CVs)")
    print("✅ Early termination (stop at 50 matches)")
    print("✅ Pre-loaded semantic model")
    print(f"✅ Result: {Fore.GREEN}{speedup1:.1f}x faster{Style.RESET_ALL} first load, {Fore.GREEN}instant{Style.RESET_ALL} cached loads")
    
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}\n")


if __name__ == "__main__":
    # INSTRUCTIONS
    print("\n" + "="*70)
    print("🎓 THESIS PRESENTATION DEMO SCRIPT")
    print("="*70)
    print("\nThis script compares OLD vs NEW matching endpoints side-by-side.")
    print("Perfect for demonstrating optimization improvements!\n")
    print("📝 BEFORE RUNNING:")
    print("   1. Make sure backend is running")
    print("   2. Update job_id below with a real job from your database")
    print("   3. Update company_email if needed")
    print("\n" + "="*70 + "\n")
    
    # Run comparison
    # TODO: Replace with actual job_id from your database
    compare_endpoints(
        job_id="DHL_001",  # ⚠️ UPDATE THIS
        company_email="dhl@company.zm"
    )
