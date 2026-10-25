#!/usr/bin/env python3
"""
Code Collector - Collect and combine code files into a single text file

Usage:
    python code_collector.py --folder ./src --output combined.txt
    python code_collector.py --files file1.ts file2.ts --output output.txt
    python code_collector.py --folder ./src --exclude node_modules dist --exclude-files *.test.ts
    python code_collector.py --folder ./src --exclude node_modules dist --include-extensions .ts .js .tsx

    
    python3 code_collector.py --folder /home/amaan/Documents/rice_world/paddysoft/scripts/auth/ --output auth.txt

    python3 code_collector.py --folder /home/amaan/Documents/rice_world/paddysoft/scripts/companies/ --output companies.txt

    python3 code_collector.py --folder /home/amaan/Documents/rice_world/paddysoft/scripts/core/ --output core.txt


    python3 code_collector.py --folder /home/amaan/Documents/rice_world/paddysoft/scripts/profiles/ --output profiles.txt

    

    python3 code_collector.py --folder /home/amaan/Documents/github/Little_Hanzi_Greek/src --output src.txt
    

"""



import os
import sys
import argparse
import fnmatch
from pathlib import Path
from datetime import datetime
from typing import List, Set, Optional

class CodeCollector:
    def __init__(self):
        self.files_processed = 0
        self.files_skipped = 0
        self.total_size = 0
        self.all_content = []
        
    def should_exclude_file(self, file_path: str, exclude_patterns: List[str]) -> bool:
        """Check if file should be excluded based on patterns"""
        file_name = os.path.basename(file_path)
        for pattern in exclude_patterns:
            if fnmatch.fnmatch(file_name, pattern):
                return True
            if fnmatch.fnmatch(file_path, pattern):
                return True
        return False
    
    def should_exclude_folder(self, folder_path: str, exclude_folders: List[str]) -> bool:
        """Check if folder should be excluded"""
        folder_name = os.path.basename(folder_path)
        for exclude in exclude_folders:
            if folder_name == exclude:
                return True
            if exclude in folder_path:
                return True
        return False
    
    def get_file_extension(self, file_path: str) -> str:
        """Get file extension with dot"""
        return os.path.splitext(file_path)[1]
    
    def get_language_from_extension(self, ext: str) -> str:
        """Map file extension to language name for markdown code blocks"""
        ext_map = {
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.py': 'python',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust',
            '.java': 'java',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.hpp': 'cpp',
            '.cs': 'csharp',
            '.php': 'php',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.sass': 'sass',
            '.less': 'less',
            '.json': 'json',
            '.xml': 'xml',
            '.yaml': 'yaml',
            '.yml': 'yaml',
            '.toml': 'toml',
            '.md': 'markdown',
            '.txt': 'text',
            '.sql': 'sql',
            '.sh': 'bash',
            '.bash': 'bash',
            '.zsh': 'bash',
            '.ps1': 'powershell',
            '.dockerfile': 'dockerfile',
            '.vue': 'vue',
            '.svelte': 'svelte',
            '.astro': 'astro',
        }
        return ext_map.get(ext, 'text')
    
    def read_file_content(self, file_path: str) -> str:
        """Read file content with proper encoding"""
        encodings = ['utf-8', 'latin-1', 'cp1252']
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
            except Exception:
                continue
        return f"[ERROR: Could not read file {file_path}]"
    
    def collect_folder(
        self,
        folder_path: str,
        output_file: str,
        exclude_folders: List[str] = None,
        exclude_files: List[str] = None,
        include_extensions: List[str] = None,
        exclude_extensions: List[str] = None,
        recursive: bool = True,
        verbose: bool = False
    ):
        """Collect all files from a folder"""
        if exclude_folders is None:
            exclude_folders = []
        if exclude_files is None:
            exclude_files = []
        if include_extensions is None:
            include_extensions = []
        if exclude_extensions is None:
            exclude_extensions = []
        
        folder_path = os.path.abspath(folder_path)
        
        if not os.path.exists(folder_path):
            print(f"❌ Folder does not exist: {folder_path}")
            return
        
        if not os.path.isdir(folder_path):
            print(f"❌ Path is not a folder: {folder_path}")
            return
        
        print(f"📁 Processing folder: {folder_path}")
        print(f"📝 Output file: {output_file}")
        print(f"🚫 Excluding folders: {exclude_folders}")
        print(f"🚫 Excluding files: {exclude_files}")
        
        if include_extensions:
            print(f"✅ Including extensions: {include_extensions}")
        if exclude_extensions:
            print(f"🚫 Excluding extensions: {exclude_extensions}")
        
        print("\n" + "="*50)
        
        # Walk through the folder
        for root, dirs, files in os.walk(folder_path):
            # Skip excluded folders
            if not recursive:
                dirs.clear()
            
            # Remove excluded folders from walk
            dirs[:] = [d for d in dirs if not self.should_exclude_folder(
                os.path.join(root, d), exclude_folders
            )]
            
            # Check if current folder should be excluded
            if self.should_exclude_folder(root, exclude_folders):
                continue
            
            # Process each file
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, folder_path)
                
                # Skip if file should be excluded
                if self.should_exclude_file(file, exclude_files):
                    if verbose:
                        print(f"⏭️  Skipping excluded file: {relative_path}")
                    self.files_skipped += 1
                    continue
                
                # Check extension
                ext = self.get_file_extension(file)
                
                if include_extensions and ext not in include_extensions:
                    if verbose:
                        print(f"⏭️  Skipping file (extension not included): {relative_path}")
                    self.files_skipped += 1
                    continue
                
                if exclude_extensions and ext in exclude_extensions:
                    if verbose:
                        print(f"⏭️  Skipping file (extension excluded): {relative_path}")
                    self.files_skipped += 1
                    continue
                
                # Read and add file content
                try:
                    content = self.read_file_content(file_path)
                    self.files_processed += 1
                    self.total_size += len(content)
                    
                    # Create section header
                    lang = self.get_language_from_extension(ext)
                    header = ""
                    
                    self.all_content.append(header)
                    self.all_content.append(f"```{lang}\n{content}\n```\n")
                    
                    if verbose:
                        print(f"✅ Added: {relative_path}")
                    
                except Exception as e:
                    print(f"❌ Error reading {relative_path}: {e}")
                    self.files_skipped += 1
    
    def collect_files(
        self,
        file_paths: List[str],
        output_file: str,
        verbose: bool = False
    ):
        """Collect specific files"""
        print(f"📁 Processing {len(file_paths)} files")
        print(f"📝 Output file: {output_file}")
        print("\n" + "="*50)
        
        for file_path in file_paths:
            if not os.path.exists(file_path):
                print(f"❌ File does not exist: {file_path}")
                self.files_skipped += 1
                continue
            
            if not os.path.isfile(file_path):
                print(f"❌ Path is not a file: {file_path}")
                self.files_skipped += 1
                continue
            
            try:
                content = self.read_file_content(file_path)
                self.files_processed += 1
                self.total_size += len(content)
                
                ext = self.get_file_extension(file_path)
                lang = self.get_language_from_extension(ext)
                
                header = f"\n{'='*80}\n📄 File: {os.path.basename(file_path)}\n📁 Path: {os.path.abspath(file_path)}\n📝 Extension: {ext}\n{'='*80}\n"
                
                self.all_content.append(header)
                self.all_content.append(f"```{lang}\n{content}\n```\n")
                
                if verbose:
                    print(f"✅ Added: {file_path}")
                
            except Exception as e:
                print(f"❌ Error reading {file_path}: {e}")
                self.files_skipped += 1
    
    def save_output(self, output_file: str):
        """Save collected content to output file"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                # Write header
                # f.write("="*80 + "\n")
                # f.write("📦 CODE COLLECTION OUTPUT\n")
                # f.write(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                # f.write(f"📊 Files processed: {self.files_processed}\n")
                # f.write(f"📊 Files skipped: {self.files_skipped}\n")
                # f.write(f"📊 Total size: {self.total_size:,} characters\n")
                # f.write("="*80 + "\n\n")
                
                # Write content
                f.write("".join(self.all_content))
                
                # # Write footer
                # f.write("\n" + "="*80 + "\n")
                # f.write("📦 END OF COLLECTION\n")
                # f.write(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                # f.write("="*80 + "\n")
            
            print("\n" + "="*50)
            print(f"✅ Successfully saved to: {output_file}")
            print(f"📊 Files processed: {self.files_processed}")
            print(f"📊 Files skipped: {self.files_skipped}")
            print(f"📊 Total size: {self.total_size:,} characters")
            print("="*50)
            
        except Exception as e:
            print(f"❌ Error saving output: {e}")
    
    def collect_and_save(
        self,
        folder_path: Optional[str] = None,
        file_paths: Optional[List[str]] = None,
        output_file: str = "code_collection.txt",
        exclude_folders: List[str] = None,
        exclude_files: List[str] = None,
        include_extensions: List[str] = None,
        exclude_extensions: List[str] = None,
        recursive: bool = True,
        verbose: bool = False
    ):
        """Main method to collect and save"""
        
        if folder_path:
            self.collect_folder(
                folder_path,
                output_file,
                exclude_folders,
                exclude_files,
                include_extensions,
                exclude_extensions,
                recursive,
                verbose
            )
        elif file_paths:
            self.collect_files(file_paths, output_file, verbose)
        else:
            print("❌ Either --folder or --files must be provided")
            return
        
        self.save_output(output_file)

def main():
    parser = argparse.ArgumentParser(
        description="Collect code files into a single text file",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Collect all files from a folder
  python code_collector.py --folder ./src --output combined.txt

  # Collect specific files
  python code_collector.py --files file1.ts file2.ts --output output.txt

  # Collect with exclusions
  python code_collector.py --folder ./src --exclude node_modules dist --exclude-files *.test.ts *.spec.ts

  # Collect only specific extensions
  python code_collector.py --folder ./src --include-extensions .ts .tsx .js

  # Exclude specific extensions
  python code_collector.py --folder ./src --exclude-extensions .css .scss

  # Non-recursive (only top level)
  python code_collector.py --folder ./src --no-recursive
        """
    )
    
    parser.add_argument(
        '--folder',
        help='Folder path to collect files from'
    )
    
    parser.add_argument(
        '--files',
        nargs='+',
        help='List of specific files to collect'
    )
    
    parser.add_argument(
        '--output',
        default='code_collection.txt',
        help='Output file path (default: code_collection.txt)'
    )
    
    parser.add_argument(
        '--exclude',
        nargs='+',
        default=[],
        help='Folders to exclude'
    )
    
    parser.add_argument(
        '--exclude-files',
        nargs='+',
        default=[],
        help='File patterns to exclude (supports wildcards)'
    )
    
    parser.add_argument(
        '--include-extensions',
        nargs='+',
        default=[],
        help='File extensions to include (e.g., .ts .tsx)'
    )
    
    parser.add_argument(
        '--exclude-extensions',
        nargs='+',
        default=[],
        help='File extensions to exclude (e.g., .css .scss)'
    )
    
    parser.add_argument(
        '--recursive',
        action='store_true',
        default=True,
        help='Process subdirectories recursively (default: True)'
    )
    
    parser.add_argument(
        '--no-recursive',
        action='store_false',
        dest='recursive',
        help='Only process top level folder'
    )
    
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Show verbose output'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.folder and not args.files:
        parser.error("Either --folder or --files must be provided")
    
    if args.folder and args.files:
        parser.error("Cannot use both --folder and --files")
    
    # Create collector and run
    collector = CodeCollector()
    
    collector.collect_and_save(
        folder_path=args.folder,
        file_paths=args.files,
        output_file=args.output,
        exclude_folders=args.exclude,
        exclude_files=args.exclude_files,
        include_extensions=args.include_extensions,
        exclude_extensions=args.exclude_extensions,
        recursive=args.recursive,
        verbose=args.verbose
    )

if __name__ == "__main__":
    main()