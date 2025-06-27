#!/bin/bash

# Exercise Database Migration Script
# This script provides easy commands to manage exercise data seeding

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} Exercise Database Migration    ${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_convex() {
    if ! command -v npx &> /dev/null; then
        print_error "npx not found. Please install Node.js and npm."
        exit 1
    fi
    
    # Check if this is a valid Convex project by looking for convex directory and package.json
    if [ ! -d "convex" ] || [ ! -f "package.json" ]; then
        print_error "This doesn't appear to be a Convex project. Please run this script from the project root."
        print_info "Expected to find: convex/ directory and package.json file"
        exit 1
    fi
    
    # Verify Convex is available
    if ! npx convex --version &> /dev/null; then
        print_error "Convex CLI not available. Please install Convex: npm install convex"
        exit 1
    fi
}

check_files() {
    if [ ! -f "seedExercises.jsonl" ]; then
        print_error "seedExercises.jsonl not found. Please ensure the file exists."
        exit 1
    fi
}

check_mutation_files() {
    check_files
    if [ ! -f "convex/seedExercises.ts" ]; then
        print_error "convex/seedExercises.ts not found. Please ensure the migration file exists."
        exit 1
    fi
}

show_help() {
    print_header
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  import-cli     Import exercises using Convex CLI (fast, no auth)"
    echo "  deploy         Deploy Convex functions"
    echo "  stats          Show current exercise statistics"
    echo "  backup         Export current exercises to backup file"
    echo "  help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0 import-cli   # Quick import for development"
    echo "  $0 deploy       # Deploy functions for mutation-based seeding"
    echo "  $0 stats        # Check current database state"
    echo
    echo "For mutation-based seeding (recommended for production):"
    echo "  1. Run: $0 deploy"
    echo "  2. Use your frontend to call: api.seedExercises.seedExercises"
    echo
}

import_cli() {
    print_info "Starting CLI import..."
    print_warning "This will import exercises without user ownership info"
    
    # Check if exercises already exist
    print_info "Checking current database state..."
    
    # Ask user what to do if table exists
    echo
    print_warning "The exercises table already exists."
    echo "What would you like to do?"
    echo "  1) Append new exercises to existing ones"
    echo "  2) Replace all existing exercises with new ones"
    echo "  3) Cancel import"
    echo
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            print_info "Importing exercises from seedExercises.jsonl (append mode)..."
            if npx convex import --table exercises --append seedExercises.jsonl; then
                print_success "Successfully imported exercises via CLI (append mode)!"
                print_info "Run '$0 stats' to verify the import"
            else
                print_error "Failed to import exercises"
                exit 1
            fi
            ;;
        2)
            print_warning "This will REPLACE all existing exercises!"
            read -p "Are you sure? (y/N): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                print_info "Importing exercises from seedExercises.jsonl (replace mode)..."
                if npx convex import --table exercises --replace seedExercises.jsonl; then
                    print_success "Successfully imported exercises via CLI (replace mode)!"
                    print_info "Run '$0 stats' to verify the import"
                else
                    print_error "Failed to import exercises"
                    exit 1
                fi
            else
                print_info "Import cancelled."
                exit 0
            fi
            ;;
        3)
            print_info "Import cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Import cancelled."
            exit 1
            ;;
    esac
}

deploy_functions() {
    print_info "Deploying Convex functions..."
    
    if npx convex deploy; then
        print_success "Successfully deployed Convex functions!"
        print_info "You can now use the mutation-based seeding in your app:"
        print_info "  - api.seedExercises.seedExercises (safe seeding)"
        print_info "  - api.seedExercises.clearAndSeedExercises (reset & seed)"
        print_info "  - api.seedExercises.getExerciseStats (check stats)"
    else
        print_error "Failed to deploy Convex functions"
        exit 1
    fi
}

show_stats() {
    print_info "Querying exercise statistics..."
    
    # This would need to be implemented with a query
    print_info "To see detailed stats, use your frontend to call:"
    print_info "  api.seedExercises.getExerciseStats"
    
    # Show basic table info if possible
    print_info "Checking if exercises table exists..."
}

backup_exercises() {
    print_info "Creating backup of current exercises..."
    
    local backup_file="exercises_backup_$(date +%Y%m%d_%H%M%S).zip"
    
    if npx convex export --path "$backup_file"; then
        print_success "Backup created: $backup_file"
    else
        print_error "Failed to create backup"
        exit 1
    fi
}

# Main script logic
main() {
    case "$1" in
        "import-cli")
            check_convex
            check_files
            import_cli
            ;;
        "deploy")
            check_convex
            check_mutation_files
            deploy_functions
            ;;
        "stats")
            check_convex
            show_stats
            ;;
        "backup")
            check_convex
            backup_exercises
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
